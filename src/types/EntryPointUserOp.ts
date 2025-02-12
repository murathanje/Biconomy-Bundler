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

