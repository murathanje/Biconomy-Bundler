import { Hash, TransactionReceipt } from 'viem';
import { publicClient } from '../../config/clients';
import { WalletState, TransactionStatus } from '../../types/WalletTypes';
import { RPCError, RPC_ERRORS } from '../../types/ErrorTypes';
import { TRANSACTION_TIMEOUT } from '../../config/constants';

export class TransactionTracker {
    public async trackTransaction(hash: Hash, state: WalletState): Promise<void> {
        if (!hash || !state) {
            throw new RPCError(
                RPC_ERRORS.INVALID_PARAMS.code,
                "Missing transaction hash or wallet state"
            );
        }

        state.transactions.set(hash, {
            hash,
            status: TransactionStatus.PENDING,
            timestamp: Date.now()
        });

        try {
            await this.waitForTransaction(hash, state);
        } catch (error) {
            console.error(`Error tracking transaction ${hash}:`, error);
            throw RPCError.fromError(error as Error, RPC_ERRORS.TRANSACTION_FAILED.code);
        }
    }

    private async waitForTransaction(hash: Hash, state: WalletState): Promise<void> {
        try {
            const receipt = await Promise.race([
                publicClient.waitForTransactionReceipt({ hash }),
                this.createTimeout(hash)
            ]) as TransactionReceipt;
            
            if (!receipt) {
                throw new RPCError(
                    RPC_ERRORS.TRANSACTION_FAILED.code,
                    RPC_ERRORS.TRANSACTION_FAILED.message
                );
            }

            const transaction = this.getTransaction(state, hash);
            await this.handleTransactionReceipt(receipt, state, transaction);
        } catch (error) {
            await this.handleTransactionError(error, state, hash);
        }
    }

    private createTimeout(hash: Hash): Promise<never> {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new RPCError(
                    RPC_ERRORS.TRANSACTION_TIMEOUT.code,
                    RPC_ERRORS.TRANSACTION_TIMEOUT.message,
                    { hash, timeout: TRANSACTION_TIMEOUT }
                ));
            }, TRANSACTION_TIMEOUT);
        });
    }

    private getTransaction(state: WalletState, hash: Hash) {
        const transaction = state.transactions.get(hash);
        if (!transaction) {
            throw new RPCError(
                RPC_ERRORS.INTERNAL_ERROR.code,
                `Transaction ${hash} not found in wallet state`,
                { hash }
            );
        }
        return transaction;
    }

    private async handleTransactionReceipt(
        receipt: TransactionReceipt,
        state: WalletState,
        transaction: { status: TransactionStatus }
    ): Promise<void> {
        if (!receipt || !state || !transaction) {
            throw new RPCError(
                RPC_ERRORS.INTERNAL_ERROR.code,
                RPC_ERRORS.INTERNAL_ERROR.message,
                { context: "Transaction receipt handling" }
            );
        }

        const currentTime = Date.now();

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
                RPC_ERRORS.TRANSACTION_FAILED.message,
                { receipt }
            );
        }

        state.lastUsed = currentTime;
        this.logTransactionStatus(state.wallet.account.address, currentTime, receipt.status);
    }

    private async handleTransactionError(error: unknown, state: WalletState, hash: Hash): Promise<void> {
        if (!state) {
            throw new RPCError(
                RPC_ERRORS.INTERNAL_ERROR.code,
                "Invalid wallet state in error handling",
                { hash }
            );
        }

        const transaction = state.transactions.get(hash);
        if (transaction) {
            transaction.status = TransactionStatus.FAILED;
        }
        
        state.pendingCount = Math.max(0, state.pendingCount - 1);
        state.failureCount++;
        state.lastUsed = Date.now();

        // Özel hata durumlarını kontrol et
        if (error instanceof RPCError) {
            throw error;
        }

        // Genel hataları RPCError'a dönüştür
        throw RPCError.fromError(error as Error, RPC_ERRORS.TRANSACTION_FAILED.code);
    }

    private logTransactionStatus(address: string, time: number, status: 'success' | 'reverted'): void {
        const statusText = status === 'success' ? '' : ' (failed transaction)';
        console.log(`Updated lastUsed for wallet ${address} to ${new Date(time).toISOString()}${statusText}`);
    }
} 