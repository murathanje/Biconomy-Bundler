import { Address, Hex } from 'viem';
import { 
    MAX_ALLOWED_GAS,
    MAX_VERIFICATION_GAS,
    MIN_VERIFICATION_GAS,
    MAX_CALLDATA_SIZE 
} from '../config/constants';
import { RPCError, RPC_ERRORS } from '../types/ErrorTypes';

// Raw UserOperation type (as received from frontend)
export interface UserOperation {
    sender: Address;
    nonce: Hex;
    initCode: Hex;
    callData: Hex;
    callGasLimit: Hex;
    verificationGasLimit: Hex;
    preVerificationGas: Hex;
    maxFeePerGas: Hex;
    maxPriorityFeePerGas: Hex;
    paymasterAndData: Hex;
    signature: Hex;
}

// Processed UserOperation with BigInt values
export interface ProcessedUserOperation {
    sender: Address;
    nonce: bigint;
    initCode: Hex;
    callData: Hex;
    callGasLimit: bigint;
    verificationGasLimit: bigint;
    preVerificationGas: bigint;
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
    paymasterAndData: Hex;
    signature: Hex;
}

// Helper function to convert hex values to ProcessedUserOperation
export function processUserOperation(userOp: UserOperation): ProcessedUserOperation {
    try {
        // Validate address format
        validateAddress(userOp.sender);

        return {
            sender: userOp.sender,
            nonce: BigInt(userOp.nonce),
            initCode: userOp.initCode,
            callData: userOp.callData,
            callGasLimit: BigInt(userOp.callGasLimit),
            verificationGasLimit: BigInt(userOp.verificationGasLimit),
            preVerificationGas: BigInt(userOp.preVerificationGas),
            maxFeePerGas: BigInt(userOp.maxFeePerGas),
            maxPriorityFeePerGas: BigInt(userOp.maxPriorityFeePerGas),
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

// Helper function to validate address format
function validateAddress(address: Address): void {
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
        throw new RPCError(
            RPC_ERRORS.INVALID_PARAMS.code,
            `Invalid address format: ${address}`
        );
    }
}

// Helper type for gas parameters validation
export interface GasParameters {
    callGasLimit: bigint;
    verificationGasLimit: bigint;
    preVerificationGas: bigint;
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
}

// Helper function to validate gas parameters according to ERC-4337 specification
export function validateGasParameters(params: GasParameters): boolean {
    // Check if all gas parameters are positive
    if (params.callGasLimit <= 0n ||
        params.verificationGasLimit <= 0n ||
        params.preVerificationGas <= 0n ||
        params.maxFeePerGas <= 0n ||
        params.maxPriorityFeePerGas <= 0n) {
        return false;
    }

    // maxPriorityFeePerGas should not be greater than maxFeePerGas
    if (params.maxPriorityFeePerGas > params.maxFeePerGas) {
        return false;
    }

    // Check if values fit in uint128
    const maxUint128 = (1n << 128n) - 1n;
    if (params.callGasLimit > maxUint128 ||
        params.verificationGasLimit > maxUint128 ||
        params.maxFeePerGas > maxUint128 ||
        params.maxPriorityFeePerGas > maxUint128) {
        return false;
    }

    // ERC-4337 specific validations
    const totalGas = params.callGasLimit + params.verificationGasLimit + params.preVerificationGas;
    
    // Check total gas limit
    if (totalGas > BigInt(MAX_ALLOWED_GAS)) {
        throw new RPCError(
            RPC_ERRORS.INVALID_PARAMS.code,
            `Total gas (${totalGas}) exceeds maximum allowed (${MAX_ALLOWED_GAS})`
        );
    }

    // Check verification gas limits
    if (params.verificationGasLimit > BigInt(MAX_VERIFICATION_GAS)) {
        throw new RPCError(
            RPC_ERRORS.INVALID_PARAMS.code,
            `Verification gas (${params.verificationGasLimit}) exceeds maximum allowed (${MAX_VERIFICATION_GAS})`
        );
    }

    if (params.verificationGasLimit < BigInt(MIN_VERIFICATION_GAS)) {
        throw new RPCError(
            RPC_ERRORS.INVALID_PARAMS.code,
            `Verification gas (${params.verificationGasLimit}) below minimum required (${MIN_VERIFICATION_GAS})`
        );
    }

    return true;
} 