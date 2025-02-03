import { sendHandleOps } from './services/TransactionService';
import { UserOperation } from './types/UserOperation';
import { validateUserOperation } from './utils/validation';
import { ENTRY_POINT_ADDRESS } from './config/constants';
import { RPCError, RPC_ERRORS } from './types/ErrorTypes';

type RawUserOperation = Omit<UserOperation, 'callGasLimit' | 'verificationGasLimit' | 'preVerificationGas' | 'maxFeePerGas' | 'maxPriorityFeePerGas'> & {
    callGasLimit: string;
    verificationGasLimit: string;
    preVerificationGas: string;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
};

export async function handleEthSendUserOperation(params: [RawUserOperation]): Promise<string> {
    const [rawUserOp] = params;
    
    try {
        const userOp: UserOperation = {
            ...rawUserOp,
            callGasLimit: BigInt(rawUserOp.callGasLimit),
            verificationGasLimit: BigInt(rawUserOp.verificationGasLimit),
            preVerificationGas: BigInt(rawUserOp.preVerificationGas),
            maxFeePerGas: BigInt(rawUserOp.maxFeePerGas),
            maxPriorityFeePerGas: BigInt(rawUserOp.maxPriorityFeePerGas)
        };
        
        validateUserOperation(userOp, ENTRY_POINT_ADDRESS);
        return sendHandleOps(userOp);
    } catch (error) {
        if (error instanceof Error) {
            throw new RPCError(
                RPC_ERRORS.INVALID_PARAMS.code,
                error.message
            );
        }
        throw error;
    }
}