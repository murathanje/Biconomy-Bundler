import { Address, Hex } from 'viem';

/**
 * Matches the UserOperation struct from the EntryPoint contract:
 * struct UserOperation {
 *     address sender;
 *     uint256 nonce;
 *     bytes initCode;
 *     bytes callData;
 *     uint256 callGasLimit;
 *     uint256 verificationGasLimit;
 *     uint256 preVerificationGas;
 *     uint256 maxFeePerGas;
 *     uint256 maxPriorityFeePerGas;
 *     bytes paymasterAndData;
 *     bytes signature;
 * }
 */
export interface EntryPointUserOp {
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

// Helper function to pack two uint128 values into bytes32
export function packUint128ToBytes32(value1: bigint, value2: bigint): Hex {
    // Ensure values fit in uint128
    const mask = (1n << 128n) - 1n;
    const v1 = value1 & mask;
    const v2 = value2 & mask;
    
    // Pack values: v1 in upper 128 bits, v2 in lower 128 bits
    const packed = (v1 << 128n) | v2;
    
    // Convert to hex and pad to 32 bytes
    return `0x${packed.toString(16).padStart(64, '0')}` as Hex;
}

// Helper function to unpack bytes32 into two uint128 values
export function unpackBytes32(packedValue: Hex): [bigint, bigint] {
    const value = BigInt(packedValue);
    const mask = (1n << 128n) - 1n;
    const value2 = value & mask;
    const value1 = value >> 128n;
    return [value1, value2];
} 