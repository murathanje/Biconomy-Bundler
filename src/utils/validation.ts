import { UserOperation } from '../types/UserOperation';
import { RPCError, RPC_ERRORS } from '../types/ErrorTypes';
import { ENTRY_POINT_ADDRESS } from '../config/constants';
import { MAX_ALLOWED_GAS, MAX_VERIFICATION_GAS, MIN_VERIFICATION_GAS, MAX_CALLDATA_SIZE } from '../config/validation';

export const BANNED_OPCODES = ['SELFDESTRUCT', 'DELEGATECALL'];
export const BANNED_ADDRESSES = new Set(['0xmaliciousContract']);

export function validateEntryPoint(entryPoint: string): void {
    if (entryPoint.toLowerCase() !== ENTRY_POINT_ADDRESS.toLowerCase()) {
        throw new RPCError(
            RPC_ERRORS.INVALID_ENTRYPOINT.code,
            RPC_ERRORS.INVALID_ENTRYPOINT.message,
            { entryPoint }
        );
    }
}

export function validatePaymaster(paymasterAndData: string): void {
    if (paymasterAndData !== '0x') {
        throw new RPCError(
            RPC_ERRORS.INVALID_PARAMS.code,
            'Paymaster not supported',
            { paymasterAndData }
        );
    }
}

export function validateGasLimits(userOp: UserOperation): void {
    if (userOp.verificationGasLimit > MAX_VERIFICATION_GAS || userOp.verificationGasLimit < MIN_VERIFICATION_GAS) {
        throw new RPCError(
            RPC_ERRORS.INVALID_PARAMS.code,
            'Invalid verification gas limit',
            { 
                verificationGas: userOp.verificationGasLimit.toString(),
                max: MAX_VERIFICATION_GAS.toString(),
                min: MIN_VERIFICATION_GAS.toString()
            }
        );
    }

    const totalGas = userOp.callGasLimit +
        (userOp.verificationGasLimit * 3n) +
        userOp.preVerificationGas;

    if (totalGas > MAX_ALLOWED_GAS) {
        throw new RPCError(
            RPC_ERRORS.INVALID_PARAMS.code,
            'Gas limit exceeds maximum allowed',
            {
                totalGas: totalGas.toString(),
                maxAllowed: MAX_ALLOWED_GAS.toString()
            }
        );
    }
}

export function validateCallDataSize(callData: string): void {
    const calldataSize = (callData.length - 2) / 2; 
    if (calldataSize > MAX_CALLDATA_SIZE) {
        throw new RPCError(
            RPC_ERRORS.INVALID_PARAMS.code,
            'Calldata size exceeds maximum allowed',
            { size: calldataSize, maxAllowed: MAX_CALLDATA_SIZE }
        );
    }
}

export function validateUserOperation(userOp: UserOperation, entryPoint: string): void {
    validateEntryPoint(entryPoint);
    validatePaymaster(userOp.paymasterAndData);
    validateGasLimits(userOp);
    validateCallDataSize(userOp.callData);
} 