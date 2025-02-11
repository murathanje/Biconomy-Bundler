import { WalletState, WalletScore } from '../../types/WalletTypes';
import { publicClient } from '../../config/clients';
import {
    MAX_PENDING_TRANSACTIONS,
    MAX_FAILURES,
    MIN_BALANCE,
    COOL_DOWN_PERIOD,
} from '../../config/constants';

// Scoring weights for wallet selection
const WALLET_SCORE_WEIGHTS = {
    BALANCE: 2.5,      // 25%
    PENDING: 2.5,      // 25%
    TIME: 3.0,         // 30%
    FAILURES: 2.0      // 20%
} as const;

export class WalletScorer {
    public isWalletAvailable(state: WalletState): boolean {
        return (
            state.pendingCount < MAX_PENDING_TRANSACTIONS &&
            state.failureCount < MAX_FAILURES &&
            Date.now() - state.lastUsed >= COOL_DOWN_PERIOD
        );
    }

    public async calculateWalletScore(address: string, state: WalletState): Promise<WalletScore | null> {
        try {
            const balance = await publicClient.getBalance({ 
                address: address as `0x${string}` 
            });

            // Normalize scores to 0-10 range
            const balanceScore = Math.min(10, Number((balance - MIN_BALANCE) / BigInt(1e16)));
            const pendingScore = ((MAX_PENDING_TRANSACTIONS - state.pendingCount) * 10) / MAX_PENDING_TRANSACTIONS;
            const timeScore = Math.min(10, (Date.now() - state.lastUsed) / (COOL_DOWN_PERIOD * 10));
            const failureScore = ((MAX_FAILURES - state.failureCount) * 10) / MAX_FAILURES;

            // Calculate weighted total score (out of 100)
            const totalScore = (
                balanceScore * WALLET_SCORE_WEIGHTS.BALANCE +
                pendingScore * WALLET_SCORE_WEIGHTS.PENDING +
                timeScore * WALLET_SCORE_WEIGHTS.TIME +
                failureScore * WALLET_SCORE_WEIGHTS.FAILURES
            );

            return { address, state, score: totalScore, balance };
        } catch (error) {
            console.warn(`Error calculating score for wallet ${address}:`, error);
            return null;
        }
    }

    public logWalletSelection(wallets: WalletScore[]): void {
        console.log('\nWallet Selection Details:');
        console.log('-------------------------');
        wallets.forEach(wallet => {
            console.log(`Address: ${wallet.address}`);
            console.log(`Score: ${wallet.score.toFixed(2)}`);
            console.log(`Balance: ${wallet.balance.toString()}`);
            console.log(`Pending Count: ${wallet.state.pendingCount}`);
            console.log(`Last Used: ${new Date(wallet.state.lastUsed).toISOString()}`);
            console.log('-------------------------');
        });
    }
} 