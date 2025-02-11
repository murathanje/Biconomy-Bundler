import { Hash } from 'viem';
import { ENTRY_POINT_ADDRESS } from '../../config/environment';
import { ProcessedUserOperation } from '../../types/UserOperation';

export class TransactionLogger {
    public logTransactionDetails(
        userOp: ProcessedUserOperation,
        hash: Hash,
        walletAddress: string,
        targetAddress: string
    ): void {
        this.logGasCalculations(userOp);
        this.logTransactionSummary(userOp, hash, walletAddress, targetAddress);
    }

    private logGasCalculations(userOp: ProcessedUserOperation): void {
        console.log('\nGas Calculation:');
        console.log('-------------------');
        console.log(`Call Gas: ${userOp.callGasLimit} * ${userOp.maxFeePerGas} = ${userOp.callGasLimit * userOp.maxFeePerGas}`);
        console.log(`Verification Gas: ${userOp.verificationGasLimit} * ${userOp.maxFeePerGas} = ${userOp.verificationGasLimit * userOp.maxFeePerGas}`);
        console.log(`Pre Verification Gas: ${userOp.preVerificationGas} * ${userOp.maxFeePerGas} = ${userOp.preVerificationGas * userOp.maxFeePerGas}`);
        console.log('-------------------\n');
    }

    private logTransactionSummary(
        userOp: ProcessedUserOperation,
        hash: Hash,
        walletAddress: string,
        targetAddress: string
    ): void {
        console.log('\nTransaction Summary:');
        console.log('-------------------');
        console.log(`Sender EOA: ${walletAddress}`);
        console.log(`EntryPoint: ${ENTRY_POINT_ADDRESS}`);
        console.log(`UserOp Sender: ${userOp.sender}`);
        console.log(`Target: ${targetAddress}`);
        console.log(`Transaction Hash: ${hash}`);
        console.log('-------------------\n');
    }
} 