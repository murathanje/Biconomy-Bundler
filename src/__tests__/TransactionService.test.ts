/// <reference types="jest" />

import { sendHandleOps } from '../services/TransactionService';
import { WalletManager } from '../services/WalletManager';
import { RPCError } from '../types/ErrorTypes';
import { UserOperation } from '../types/UserOperation';
import { publicClient } from '../config/clients';
import { Hash } from 'viem';

// Mock WalletManager
jest.mock('../services/WalletManager');

// Mock viem's publicClient
jest.mock('../config/clients', () => ({
    publicClient: {
        estimateContractGas: jest.fn(),
        waitForTransactionReceipt: jest.fn()
    }
}));

describe('TransactionService', () => {
    let mockWallet: any;
    let mockWalletManager: jest.Mocked<typeof WalletManager>;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockWallet = {
            account: {
                address: '0x123',
            },
            writeContract: jest.fn()
        };

        (WalletManager.getInstance as jest.Mock).mockReturnValue({
            selectWallet: jest.fn().mockResolvedValue(mockWallet),
            trackTransaction: jest.fn()
        });

        mockWalletManager = WalletManager as jest.Mocked<typeof WalletManager>;
    });

    const mockUserOp: UserOperation = {
        sender: '0x123',
        nonce: '0',
        initCode: '0x',
        callData: '0x123456',
        callGasLimit: BigInt(1000000),
        verificationGasLimit: BigInt(1000000),
        preVerificationGas: BigInt(1000000),
        maxFeePerGas: BigInt(1000000000),
        maxPriorityFeePerGas: BigInt(1000000000),
        paymasterAndData: '0x',
        signature: '0x'
    };

    it('should successfully send a transaction', async () => {
        const expectedHash = '0x789' as Hash;
        
        (publicClient.estimateContractGas as jest.Mock).mockResolvedValueOnce(BigInt(1000000));
        mockWallet.writeContract.mockResolvedValueOnce(expectedHash);

        const hash = await sendHandleOps(mockUserOp);
        
        expect(hash).toBe(expectedHash);
        expect(mockWallet.writeContract).toHaveBeenCalled();
    });

    it('should handle invalid callData', async () => {
        const invalidUserOp = { ...mockUserOp, callData: '0x' };
        
        await expect(sendHandleOps(invalidUserOp)).rejects.toThrow(RPCError);
    });

    it('should handle banned address', async () => {
        const bannedUserOp = { 
            ...mockUserOp, 
            callData: '0x0000000000000000000000000xmaliciousContract0000000000000000000000' 
        };
        
        await expect(sendHandleOps(bannedUserOp)).rejects.toThrow(RPCError);
    });

    it('should retry on transaction failure', async () => {
        const error = new Error('Transaction failed');
        mockWallet.writeContract.mockRejectedValueOnce(error);
        mockWallet.writeContract.mockResolvedValueOnce('0x789' as Hash);

        const hash = await sendHandleOps(mockUserOp);
        
        expect(mockWallet.writeContract).toHaveBeenCalledTimes(2);
        expect(hash).toBe('0x789');
    });

    it('should throw after max retries', async () => {
        const error = new Error('Transaction failed');
        mockWallet.writeContract.mockRejectedValue(error);

        await expect(sendHandleOps(mockUserOp)).rejects.toThrow(RPCError);
    });
}); 