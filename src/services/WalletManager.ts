import { Account, createWalletClient, Hash, TransactionReceipt } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { Mutex } from 'async-mutex';
import { CustomWalletClient, WalletState, TransactionStatus } from '../types/WalletTypes';
import { RPCError, RPC_ERRORS } from '../types/ErrorTypes';
import { transport, publicClient } from '../config/clients';
import { sepolia } from 'viem/chains';

export class WalletManager {
    private walletStates: Map<string, WalletState> = new Map();
    private mutex = new Mutex();
    private readonly MAX_PENDING = 3;
    private readonly MAX_FAILURES = 3;
    private readonly MIN_BALANCE = BigInt(1e16); // 0.01 ETH
    private readonly COOL_DOWN_PERIOD = 5000; // 5 seconds
    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAY = 2000; // 2 seconds
    private readonly TRANSACTION_TIMEOUT = 300000; // 5 minutes
    private static instance: WalletManager;

    private constructor(privateKeys: string[]) {
        this.initializeWallets(privateKeys);
    }

    public static getInstance(): WalletManager {
        if (!WalletManager.instance) {
            const pk1 = process.env.EOA1_PK;
            const pk2 = process.env.EOA2_PK;

            if (!pk1 || !pk2) {
                throw new RPCError(
                    RPC_ERRORS.INTERNAL_ERROR.code,
                    "EOA private keys not configured"
                );
            }

            WalletManager.instance = new WalletManager([pk1, pk2]);
        }
        return WalletManager.instance;
    }

    private async initializeWallets(privateKeys: string[]) {
        for (const pk of privateKeys) {
            const account = privateKeyToAccount(pk as `0x${string}`);
            const wallet = createWalletClient({
                account,
                chain: sepolia,
                transport,
            }) as CustomWalletClient;
            
            const nonce = await publicClient.getTransactionCount({ address: account.address });
            
            this.walletStates.set(account.address, {
                wallet,
                pendingCount: 0,
                failureCount: 0,
                lastUsed: 0,
                currentNonce: BigInt(nonce),
                transactions: new Map()
            });
        }
    }

    private async checkAndUpdateBalance(address: string): Promise<void> {
        const balance = await publicClient.getBalance({ address: address as `0x${string}` });
        if (balance < this.MIN_BALANCE) {
            throw new RPCError(
                RPC_ERRORS.INSUFFICIENT_BALANCE.code,
                `EOA ${address} has insufficient balance`,
                { balance: balance.toString(), minimum: this.MIN_BALANCE.toString() }
            );
        }
    }

    private async waitForTransaction(hash: Hash, address: string): Promise<void> {
        try {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new RPCError(
                        RPC_ERRORS.TRANSACTION_TIMEOUT.code,
                        'Transaction timed out',
                        { hash, timeout: this.TRANSACTION_TIMEOUT }
                    ));
                }, this.TRANSACTION_TIMEOUT);
            });

            const receiptPromise = publicClient.waitForTransactionReceipt({ hash });
            const receipt = await Promise.race([receiptPromise, timeoutPromise]) as TransactionReceipt;
            
            const state = this.walletStates.get(address);
            if (!state) {
                throw new RPCError(
                    RPC_ERRORS.INTERNAL_ERROR.code,
                    'Wallet state not found',
                    { address }
                );
            }
            
            const transaction = state.transactions.get(hash);
            if (!transaction) {
                throw new RPCError(
                    RPC_ERRORS.INTERNAL_ERROR.code,
                    'Transaction not found',
                    { hash }
                );
            }

            if (receipt.status === 'success') {
                transaction.status = TransactionStatus.CONFIRMED;
                state.pendingCount = Math.max(0, state.pendingCount - 1);
                state.failureCount = 0;
                state.currentNonce++;
            } else {
                transaction.status = TransactionStatus.FAILED;
                state.pendingCount = Math.max(0, state.pendingCount - 1);
                state.failureCount++;

                throw new RPCError(
                    RPC_ERRORS.TRANSACTION_FAILED.code,
                    'Transaction reverted',
                    { hash, receipt }
                );
            }
        } catch (error) {
            const state = this.walletStates.get(address);
            if (state) {
                const transaction = state.transactions.get(hash);
                if (transaction) {
                    transaction.status = TransactionStatus.FAILED;
                }
                state.pendingCount = Math.max(0, state.pendingCount - 1);
                state.failureCount++;
            }
            
            throw RPCError.fromError(error as Error);
        }
    }

    public async selectWallet(): Promise<CustomWalletClient> {
        return await this.mutex.runExclusive(async () => {
            let selectedWallet: CustomWalletClient | null = null;
            let selectedAddress: string | null = null;
            let lowestPending = this.MAX_PENDING;
            let earliestLastUsed = Date.now();

            let allFailed = true;
            for (const state of this.walletStates.values()) {
                if (state.failureCount < this.MAX_FAILURES) {
                    allFailed = false;
                    break;
                }
            }
            if (allFailed) {
                await this.resetFailedWallets();
            }

            for (const [address, state] of this.walletStates.entries()) {
                if (state.failureCount >= this.MAX_FAILURES) {
                    continue;
                }

                if (Date.now() - state.lastUsed < this.COOL_DOWN_PERIOD) {
                    continue;
                }

                if (state.pendingCount >= this.MAX_PENDING) {
                    continue;
                }

                if (state.pendingCount < lowestPending || 
                    (state.pendingCount === lowestPending && state.lastUsed < earliestLastUsed)) {
                    selectedWallet = state.wallet;
                    selectedAddress = address;
                    lowestPending = state.pendingCount;
                    earliestLastUsed = state.lastUsed;
                }
            }

            if (!selectedWallet || !selectedAddress) {
                throw new RPCError(
                    RPC_ERRORS.NO_WALLET.code,
                    'No available wallet found',
                    { 
                        maxPending: this.MAX_PENDING,
                        maxFailures: this.MAX_FAILURES,
                        cooldownPeriod: this.COOL_DOWN_PERIOD
                    }
                );
            }

            try {
                await this.checkAndUpdateBalance(selectedAddress);
            } catch (error) {
                throw RPCError.fromError(error as Error, RPC_ERRORS.INSUFFICIENT_BALANCE.code);
            }

            const state = this.walletStates.get(selectedAddress)!;
            state.lastUsed = Date.now();
            state.pendingCount++;

            return selectedWallet;
        });
    }

    public async trackTransaction(hash: Hash, address: string): Promise<void> {
        const state = this.walletStates.get(address);
        if (!state) {
            throw new RPCError(
                RPC_ERRORS.INTERNAL_ERROR.code,
                "Wallet not found"
            );
        }

        state.transactions.set(hash, {
            hash,
            status: TransactionStatus.PENDING,
            timestamp: Date.now()
        });

        this.waitForTransaction(hash, address).catch(error => {
            console.error(`Error tracking transaction ${hash}:`, error);
        });
    }

    public async getNonce(address: string): Promise<bigint> {
        const state = this.walletStates.get(address);
        if (!state) {
            throw new RPCError(
                RPC_ERRORS.INTERNAL_ERROR.code,
                "Wallet not found"
            );
        }
        return state.currentNonce;
    }

    public async resetFailedWallets(): Promise<void> {
        for (const state of this.walletStates.values()) {
            if (state.failureCount >= this.MAX_FAILURES) {
                state.failureCount = 0;
                state.lastUsed = 0;
            }
        }
    }
}