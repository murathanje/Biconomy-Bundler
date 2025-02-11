import { hexToBigInt, type Hex, type Address } from 'viem';
import { UserOperation, ProcessedUserOperation } from '../types/UserOperation';
import { RPCError, RPC_ERRORS } from '../types/ErrorTypes';

// Helper function to safely convert hex to bigint
function safeHexToBigInt(value: Hex, fieldName: string): bigint {
    try {
        return hexToBigInt(value);
    } catch (error) {
        throw new RPCError(
            RPC_ERRORS.INVALID_PARAMS.code,
            `Invalid hex value for ${fieldName}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

// Helper function to validate address format
function validateAddress(address: Address): void {
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
        throw new RPCError(
            RPC_ERRORS.INVALID_PARAMS.code,
            `Invalid address format: ${address}`
        );
    }
}

export function processUserOperation(userOp: UserOperation): ProcessedUserOperation {
    try {
        // Validate address format
        validateAddress(userOp.sender);

        return {
            sender: userOp.sender,
            nonce: safeHexToBigInt(userOp.nonce, 'nonce'),
            initCode: userOp.initCode,
            callData: userOp.callData,
            callGasLimit: safeHexToBigInt(userOp.callGasLimit, 'callGasLimit'),
            verificationGasLimit: safeHexToBigInt(userOp.verificationGasLimit, 'verificationGasLimit'),
            preVerificationGas: safeHexToBigInt(userOp.preVerificationGas, 'preVerificationGas'),
            maxFeePerGas: safeHexToBigInt(userOp.maxFeePerGas, 'maxFeePerGas'),
            maxPriorityFeePerGas: safeHexToBigInt(userOp.maxPriorityFeePerGas, 'maxPriorityFeePerGas'),
            paymasterAndData: userOp.paymasterAndData,
            signature: userOp.signature
        };
    } catch (error) {
        if (error instanceof RPCError) {
            throw error;
        }
        throw new RPCError(
            RPC_ERRORS.INVALID_PARAMS.code,
            `Failed to process UserOperation: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
} 