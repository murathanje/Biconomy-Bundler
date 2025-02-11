import { createWalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { CustomWalletClient, WalletState } from '../../types/WalletTypes';
import { RPCError, RPC_ERRORS } from '../../types/ErrorTypes';
import { transport, publicClient } from '../../config/clients';
import { localChain } from '../../config/chain';
import { MAX_FAILURES, COOL_DOWN_PERIOD } from '../../config/constants';

export class WalletStateManager {
    private walletStates = new Map<string, WalletState>();

    public async initializeWallets(privateKeys: string[]): Promise<void> {
        if (!privateKeys || privateKeys.length !== 2) {
            throw new RPCError(
                RPC_ERRORS.INTERNAL_ERROR.code,
                "Exactly two private keys must be provided for wallet initialization"
            );
        }

        const currentTime = Date.now();

        await Promise.all(privateKeys.map(async (pk, index) => {
            try {
                const account = privateKeyToAccount(pk as `0x${string}`);
                const wallet = createWalletClient({
                    account,
                    chain: localChain,
                    transport,
                }) as CustomWalletClient;
                
                const nonce = await publicClient.getTransactionCount({ 
                    address: account.address 
                });
                
                // Stagger wallet cooldowns
                const lastUsed = currentTime - (COOL_DOWN_PERIOD * (index + 1));
                
                this.walletStates.set(account.address, {
                    wallet,
                    pendingCount: 0,
                    failureCount: 0,
                    lastUsed,
                    currentNonce: BigInt(nonce),
                    transactions: new Map()
                });

                this.logWalletInitialization(account.address, nonce, lastUsed);
            } catch (error) {
                throw new RPCError(
                    RPC_ERRORS.INTERNAL_ERROR.code,
                    `Failed to initialize wallet: ${error instanceof Error ? error.message : 'Unknown error'}`
                );
            }
        }));

        if (this.walletStates.size !== 2) {
            throw new RPCError(
                RPC_ERRORS.INTERNAL_ERROR.code,
                "Both wallets must be initialized successfully"
            );
        }
    }

    public getWalletState(address: string): WalletState {
        const state = this.walletStates.get(address);
        if (!state) {
            throw new RPCError(
                RPC_ERRORS.INTERNAL_ERROR.code,
                "Wallet not found"
            );
        }
        return state;
    }

    public getAllWalletStates(): Map<string, WalletState> {
        return this.walletStates;
    }

    public async resetFailedWallets(): Promise<void> {
        let resetCount = 0;
        const currentTime = Date.now();

        for (const [address, state] of this.walletStates.entries()) {
            if (state.failureCount >= MAX_FAILURES) {
                state.failureCount = 0;
                state.lastUsed = currentTime - COOL_DOWN_PERIOD;
                resetCount++;
                console.log(`Reset wallet ${address} due to too many failures`);
            }
        }

        if (resetCount > 0) {
            console.log(`Reset ${resetCount} wallet(s) due to failures`);
        }
    }

    private logWalletInitialization(address: string, nonce: number, lastUsed: number): void {
        console.log(`Initialized wallet ${address} with nonce ${nonce} and lastUsed ${new Date(lastUsed).toISOString()}`);
    }

    public logNoAvailableWallets(): void {
        console.warn('No available wallets found. Wallet states:');
        this.walletStates.forEach((state, address) => {
            console.warn(`Wallet ${address}:`, {
                pendingCount: state.pendingCount,
                failureCount: state.failureCount,
                lastUsed: new Date(state.lastUsed).toISOString(),
                timeSinceLastUse: Date.now() - state.lastUsed
            });
        });
    }
} 