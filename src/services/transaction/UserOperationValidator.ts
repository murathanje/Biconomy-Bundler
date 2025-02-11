import { decodeFunctionData } from 'viem';
import { BANNED_ADDRESSES, MAX_VERIFICATION_GAS } from '../../config/constants';
import { SMART_ACCOUNT_ABI } from '../../abi';
import { ProcessedUserOperation } from '../../types/UserOperation';
import { EntryPointUserOp } from '../../types/EntryPointUserOp';
import { RPCError, RPC_ERRORS } from '../../types/ErrorTypes';

export class UserOperationValidator {
    public validateAndFormat(userOp: ProcessedUserOperation): { 
        formattedUserOp: EntryPointUserOp;
        targetAddress: string;
    } {
        this.validateRequiredFields(userOp);
        const targetAddress = this.validateCallData(userOp);
        this.validateGasLimits(userOp);
        const formattedUserOp = this.formatUserOp(userOp);

        return { formattedUserOp, targetAddress };
    }

    private validateRequiredFields(userOp: ProcessedUserOperation): void {
        if (!userOp.sender || !userOp.nonce || !userOp.initCode || !userOp.callData ||
            !userOp.callGasLimit || !userOp.verificationGasLimit || !userOp.preVerificationGas ||
            !userOp.maxFeePerGas || !userOp.maxPriorityFeePerGas || !userOp.paymasterAndData ||
            !userOp.signature) {
            throw new RPCError(
                RPC_ERRORS.INVALID_PARAMS.code,
                "Missing required UserOperation fields",
                { userOp }
            );
        }
    }

    private validateCallData(userOp: ProcessedUserOperation): string {
        const decoded = decodeFunctionData({
            abi: SMART_ACCOUNT_ABI,
            data: userOp.callData as `0x${string}`
        });

        if (!decoded.args) {
            throw new RPCError(
                RPC_ERRORS.INVALID_PARAMS.code,
                "Invalid callData: Could not decode function arguments"
            );
        }

        const targetAddress = decoded.args[0] as string;
        
        if (BANNED_ADDRESSES.has(targetAddress)) {
            throw new RPCError(
                RPC_ERRORS.BANNED_ADDRESS.code,
                RPC_ERRORS.BANNED_ADDRESS.message,
                { address: targetAddress }
            );
        }

        return targetAddress;
    }

    private validateGasLimits(userOp: ProcessedUserOperation): void {
        if (userOp.verificationGasLimit > MAX_VERIFICATION_GAS) {
            throw new RPCError(
                RPC_ERRORS.INVALID_PARAMS.code,
                `Verification gas limit exceeds maximum allowed (${MAX_VERIFICATION_GAS})`
            );
        }
    }

    private formatUserOp(userOp: ProcessedUserOperation): EntryPointUserOp {
        try {
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
            throw new RPCError(
                RPC_ERRORS.INVALID_PARAMS.code,
                "Invalid numeric values in UserOperation",
                { error: error instanceof Error ? error.message : 'Unknown error' }
            );
        }
    }
} 