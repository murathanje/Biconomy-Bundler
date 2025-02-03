import { WalletClient, Hash } from 'viem';
import { PrivateKeyAccount } from 'viem/accounts';

export type CustomWalletClient = WalletClient & {
    account: PrivateKeyAccount;
};

export enum TransactionStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    FAILED = 'FAILED'
}

export interface Transaction {
    hash: Hash;
    status: TransactionStatus;
    timestamp: number;
}

export interface WalletState {
    wallet: CustomWalletClient;
    pendingCount: number;
    failureCount: number;
    lastUsed: number;
    currentNonce: bigint;
    transactions: Map<Hash, Transaction>;
} 