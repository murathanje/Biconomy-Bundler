import { WalletClient, Hash } from 'viem';
import { PrivateKeyAccount } from 'viem/accounts';

export type CustomWalletClient = WalletClient & {
    account: PrivateKeyAccount;
};

export enum TransactionStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    FAILED = 'failed'
}

export interface TransactionInfo {
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
    transactions: Map<Hash, TransactionInfo>;
}

export interface WalletScore {
    address: string;
    state: WalletState;
    score: number;
    balance: bigint;
} 