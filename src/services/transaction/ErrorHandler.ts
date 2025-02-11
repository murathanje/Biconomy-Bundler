import { MAX_ATTEMPTS, RETRY_DELAY } from '../../config/constants';
import { RPCError, RPC_ERRORS } from '../../types/ErrorTypes';

export class ErrorHandler {
    public async handleTransactionError(error: any, attempt: number): Promise<never> {
        if (error.message.includes("AA24 signature error")) {
            throw new RPCError(
                RPC_ERRORS.INVALID_SIGNATURE.code,
                "Invalid UserOperation signature",
                { details: error.message }
            );
        }
        
        if (attempt >= MAX_ATTEMPTS) {
            throw new RPCError(
                RPC_ERRORS.MAX_RETRIES_EXCEEDED.code,
                `Failed after ${MAX_ATTEMPTS} attempts: ${error.message}`
            );
        }

        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        throw error;
    }
} 