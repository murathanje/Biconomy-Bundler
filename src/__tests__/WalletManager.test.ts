/// <reference types="jest" />

import { WalletManager } from '../services/WalletManager';
import { RPCError } from '../types/ErrorTypes';
import { TransactionStatus } from '../types/WalletTypes';
import { publicClient } from '../config/clients';
import { Hash } from 'viem';

// Mock environment variables
process.env.EOA1_PK = '0x1234567890123456789012345678901234567890123456789012345678901234';
process.env.EOA2_PK = '0x2234567890123456789012345678901234567890123456789012345678901234';

// Mock viem's publicClient
jest.mock('../config/clients', () => ({
    publicClient: {
        getTransactionCount: jest.fn().mockResolvedValue(0n),
        getBalance: jest.fn().mockResolvedValue(BigInt(1e18)),
        waitForTransactionReceipt: jest.fn()
    }
}));

describe('WalletManager', () => {
    let walletManager: WalletManager;

    beforeEach(() => {
        jest.clearAllMocks();
        walletManager = WalletManager.getInstance();
    });

    describe('selectWallet', () => {
        it('should select a wallet with lowest pending count', async () => {
            const wallet = await walletManager.selectWallet();
            expect(wallet).toBeDefined();
            expect(wallet.account).toBeDefined();
        });

        it('should throw error when no wallets are available', async () => {
            // Mock multiple pending transactions
            const wallet1 = await walletManager.selectWallet();
            const wallet2 = await walletManager.selectWallet();
            const wallet3 = await walletManager.selectWallet();

            await expect(walletManager.selectWallet()).rejects.toThrow(RPCError);
        });

        it('should throw error when wallet has insufficient balance', async () => {
            (publicClient.getBalance as jest.Mock).mockResolvedValueOnce(BigInt(0));
            await expect(walletManager.selectWallet()).rejects.toThrow(RPCError);
        });
    });

    describe('trackTransaction', () => {
        it('should track successful transaction', async () => {
            const wallet = await walletManager.selectWallet();
            const hash = '0x123' as Hash;

            (publicClient.waitForTransactionReceipt as jest.Mock).mockResolvedValueOnce({
                status: 'success'
            });

            await walletManager.trackTransaction(hash, wallet.account.address);
            
            // Wait for transaction tracking to complete
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const nonce = await walletManager.getNonce(wallet.account.address);
            expect(nonce).toBe(1n);
        });

        it('should handle failed transaction', async () => {
            const wallet = await walletManager.selectWallet();
            const hash = '0x456' as Hash;

            (publicClient.waitForTransactionReceipt as jest.Mock).mockResolvedValueOnce({
                status: 'reverted'
            });

            await walletManager.trackTransaction(hash, wallet.account.address);
            
            // Wait for transaction tracking to complete
            await new Promise(resolve => setTimeout(resolve, 100));
            
            await expect(walletManager.selectWallet()).rejects.toThrow(RPCError);
        });

        it('should handle transaction timeout', async () => {
            const wallet = await walletManager.selectWallet();
            const hash = '0x789' as Hash;

            (publicClient.waitForTransactionReceipt as jest.Mock).mockImplementationOnce(() => 
                new Promise(resolve => setTimeout(resolve, 6000))
            );

            await walletManager.trackTransaction(hash, wallet.account.address);
            
            // Wait for transaction tracking to complete
            await new Promise(resolve => setTimeout(resolve, 100));
            
            await expect(walletManager.selectWallet()).rejects.toThrow(RPCError);
        });
    });
}); 