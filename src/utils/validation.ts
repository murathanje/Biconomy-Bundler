import { ProcessedUserOperation, UserOperation, validateGasParameters } from '../types/UserOperation';
import { RPCError, RPC_ERRORS } from '../types/ErrorTypes';
import { MAX_CALLDATA_SIZE } from '../config/constants';

export const BANNED_ADDRESSES = new Set(['0xmaliciousContract']);

// Raw UserOperation validation
export function validateRawUserOp(userOp: UserOperation) {
    try {
        // Check required fields
        const requiredFields = [
            'sender', 'nonce', 'initCode', 'callData',
            'callGasLimit', 'verificationGasLimit', 'preVerificationGas',
            'maxFeePerGas', 'maxPriorityFeePerGas',
            'paymasterAndData', 'signature'
        ];
        
        requiredFields.forEach(field => {
            if (!userOp[field as keyof UserOperation]) {
                throw new Error(`Missing required field: ${field}`);
            }
        });

        // Validate sender address format
        if (!userOp.sender.startsWith('0x') || userOp.sender.length !== 42) {
            throw new Error('Invalid sender address format');
        }

        // Validate hex format for all fields
        const hexFields = [
            'nonce', 'initCode', 'callData', 'callGasLimit',
            'verificationGasLimit', 'preVerificationGas',
            'maxFeePerGas', 'maxPriorityFeePerGas',
            'paymasterAndData', 'signature'
        ];
        
        hexFields.forEach(field => {
            const value = userOp[field as keyof UserOperation];
            if (!value.startsWith('0x')) {
                throw new Error(`Field ${field} must be in hex format`);
            }
        });

    } catch (error) {
        throw new RPCError(
            RPC_ERRORS.INVALID_PARAMS.code,
            error instanceof Error ? error.message : 'Invalid raw UserOperation'
        );
    }
}

// Processed UserOperation validation
export function validateUserOperation(userOp: ProcessedUserOperation) {
    try {
        // Validate sender address format
        if (!userOp.sender.startsWith('0x') || userOp.sender.length !== 42) {
            throw new Error('Invalid sender address format');
        }

        // Validate hex format for required fields
        const hexFields = ['initCode', 'callData', 'paymasterAndData', 'signature'];
        hexFields.forEach(field => {
            const value = userOp[field as keyof ProcessedUserOperation];
            if (typeof value === 'string' && !value.startsWith('0x')) {
                throw new Error(`Field ${field} must be in hex format`);
            }
        });

        // Validate calldata size
        if ((userOp.callData.length - 2) / 2 > MAX_CALLDATA_SIZE) {
            throw new Error(`Calldata size exceeds maximum allowed (${MAX_CALLDATA_SIZE} bytes)`);
        }

        // Validate gas parameters
        const gasParams = {
            callGasLimit: userOp.callGasLimit,
            verificationGasLimit: userOp.verificationGasLimit,
            preVerificationGas: userOp.preVerificationGas,
            maxFeePerGas: userOp.maxFeePerGas,
            maxPriorityFeePerGas: userOp.maxPriorityFeePerGas
        };

        if (!validateGasParameters(gasParams)) {
            throw new Error('Invalid gas parameters');
        }

    } catch (error) {
        throw new RPCError(
            RPC_ERRORS.INVALID_PARAMS.code,
            error instanceof Error ? error.message : 'Invalid UserOperation'
        );
    }
} 