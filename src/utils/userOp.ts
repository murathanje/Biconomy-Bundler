import { UserOperation } from '../types/UserOperation';
import { EntryPointUserOp } from '../types/EntryPointUserOp';
import { packGasParams } from './gas';

export function formatUserOp(userOp: UserOperation): EntryPointUserOp {
    const { accountGasLimits, gasFees } = packGasParams(
        BigInt(userOp.callGasLimit),
        BigInt(userOp.verificationGasLimit),
        BigInt(userOp.maxFeePerGas),
        BigInt(userOp.maxPriorityFeePerGas)
    );

    return {
        sender: userOp.sender as `0x${string}`,
        nonce: BigInt(userOp.nonce),
        initCode: userOp.initCode as `0x${string}`,
        callData: userOp.callData as `0x${string}`,
        accountGasLimits,
        preVerificationGas: BigInt(userOp.preVerificationGas),
        gasFees,
        paymasterAndData: userOp.paymasterAndData as `0x${string}`,
        signature: userOp.signature as `0x${string}`
    };
} 