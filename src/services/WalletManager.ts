import { Hash } from 'viem';
import { Mutex } from 'async-mutex';
import { CustomWalletClient } from '../types/WalletTypes';
import { RPCError, RPC_ERRORS } from '../types/ErrorTypes';
import { WalletScorer } from './wallet/WalletScorer';
import { TransactionTracker } from './wallet/TransactionTracker';
import { WalletStateManager } from './wallet/WalletStateManager';
import { 
    MAX_PENDING_TRANSACTIONS, 
    MAX_FAILURES, 
    COOL_DOWN_PERIOD,
    MIN_BALANCE 
} from '../config/constants';
import { EOA1_PK, EOA2_PK } from '../config/environment';

export class WalletManager {
    private static instance: WalletManager;
    private initialized = false;
    private readonly mutex = new Mutex();
    private readonly stateManager: WalletStateManager;
    private readonly scorer: WalletScorer;
    private readonly transactionTracker: TransactionTracker;

    private constructor() {
        this.stateManager = new WalletStateManager();
        this.scorer = new WalletScorer();
        this.transactionTracker = new TransactionTracker();
    }

    public static async getInstance(): Promise<WalletManager> {
        if (!WalletManager.instance) {
            if (!EOA1_PK || !EOA2_PK) {
                throw new RPCError(
                    RPC_ERRORS.INTERNAL_ERROR.code,
                    "Both EOA1_PK and EOA2_PK must be configured"
                );
            }

            WalletManager.instance = new WalletManager();
            await WalletManager.instance.initialize([EOA1_PK, EOA2_PK]);
        }
        return WalletManager.instance;
    }

    private async initialize(privateKeys: string[]): Promise<void> {
        if (this.initialized) return;
        await this.stateManager.initializeWallets(privateKeys);
        this.initialized = true;
    }

    private async findAvailableWallet(): Promise<[string, CustomWalletClient] | null> {
        await this.stateManager.resetFailedWallets();
        
        const walletStates = this.stateManager.getAllWalletStates();
        const availableWallets = Array.from(walletStates.entries())
            .filter(([_, state]) => this.scorer.isWalletAvailable(state));

        if (availableWallets.length === 0) {
            this.stateManager.logNoAvailableWallets();
            return null;
        }

        const walletScores = await Promise.all(
            availableWallets.map(([address, state]) => 
                this.scorer.calculateWalletScore(address, state)
            )
        );

        const validWallets = walletScores
            .filter((wallet): wallet is NonNullable<typeof wallet> => 
                wallet !== null && wallet.balance >= MIN_BALANCE
            );

        if (validWallets.length === 0) return null;

        const bestWallet = validWallets.reduce((best, current) => 
            current.score > best.score ? current : best
        );

        this.scorer.logWalletSelection(validWallets);
        return [bestWallet.address, bestWallet.state.wallet];
    }

    public async selectWallet(): Promise<CustomWalletClient> {
        if (!this.initialized) {
            throw new RPCError(
                RPC_ERRORS.INTERNAL_ERROR.code,
                'WalletManager not initialized'
            );
        }

        return await this.mutex.runExclusive(async () => {
            const walletEntry = await this.findAvailableWallet();
            
            if (!walletEntry) {
                throw new RPCError(
                    RPC_ERRORS.NO_WALLET.code,
                    'No available wallets found',
                    { 
                        maxPending: MAX_PENDING_TRANSACTIONS,
                        maxFailures: MAX_FAILURES,
                        cooldownPeriod: COOL_DOWN_PERIOD
                    }
                );
            }

            const [address, wallet] = walletEntry;
            const state = this.stateManager.getWalletState(address);
            state.pendingCount++;
            return wallet;
        });
    }

    public async trackTransaction(hash: Hash, address: string): Promise<void> {
        const state = this.stateManager.getWalletState(address);
        await this.transactionTracker.trackTransaction(hash, state);
    }

    public async getNonce(address: string): Promise<bigint> {
        return this.stateManager.getWalletState(address).currentNonce;
    }
}