import { sendHandleOps } from './services/TransactionService';
import { UserOperation, processUserOperation } from './types/UserOperation';
import { validateUserOperation, validateRawUserOp } from './utils/validation';
import { RPCError, RPC_ERRORS } from './types/ErrorTypes';

export async function handleEthSendUserOperation(rawUserOp: UserOperation): Promise<string> {
    try {
        // Validate raw user operation format
        validateRawUserOp(rawUserOp);

        // Process string values to BigInt
        const processedUserOp = processUserOperation(rawUserOp);
        
        // Validate the processed user operation
        validateUserOperation(processedUserOp);
        
        // Send the operation
        return sendHandleOps(processedUserOp);
    } catch (error) {
        console.error('Transaction error:', error);
        throw new RPCError(
            RPC_ERRORS.INVALID_PARAMS.code,
            error instanceof Error ? error.message : 'Unknown error'
        );
    }
}