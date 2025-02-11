// Standard JSON-RPC Error Codes
const STANDARD_ERRORS = {
    PARSE_ERROR: { code: -32700, message: "Parse error" },
    INVALID_REQUEST: { code: -32600, message: "Invalid Request" },
    METHOD_NOT_FOUND: { code: -32601, message: "Method not found" },
    INVALID_PARAMS: { code: -32602, message: "Invalid params" },
    INTERNAL_ERROR: { code: -32603, message: "Internal error" },
} as const;

// EntryPoint Related Error Codes
const ENTRYPOINT_ERRORS = {
    INVALID_ENTRYPOINT: { code: -32100, message: "Invalid EntryPoint address" },
    SIMULATION_FAILED: { code: -32101, message: "UserOperation simulation failed" },
    INVALID_SIGNATURE: { code: -32102, message: "Invalid UserOperation signature" },
    INVALID_NONCE: { code: -32103, message: "Invalid nonce" },
    INVALID_INIT_CODE: { code: -32104, message: "Invalid initCode" },
    INVALID_PAYMASTER: { code: -32105, message: "Invalid paymaster data" },
} as const;

// Bundler Related Error Codes
const BUNDLER_ERRORS = {
    NO_WALLET: { code: -32200, message: "No available wallet" },
    INSUFFICIENT_BALANCE: { code: -32201, message: "Insufficient wallet balance" },
    MAX_RETRIES_EXCEEDED: { code: -32202, message: "Maximum retry attempts exceeded" },
    TRANSACTION_FAILED: { code: -32203, message: "Transaction execution failed" },
    TRANSACTION_TIMEOUT: { code: -32204, message: "Transaction timed out" },
    GAS_LIMIT_EXCEEDED: { code: -32205, message: "Gas limit exceeded" },
    NONCE_TOO_LOW: { code: -32206, message: "Nonce too low" },
    REPLACEMENT_UNDERPRICED: { code: -32207, message: "Replacement transaction underpriced" },
} as const;

// Security Related Error Codes
const SECURITY_ERRORS = {
    BANNED_OPCODE: { code: -32300, message: "Banned operation detected" },
    BANNED_ADDRESS: { code: -32301, message: "Banned contract interaction" },
    RATE_LIMITED: { code: -32302, message: "Too many requests" },
    UNAUTHORIZED: { code: -32303, message: "Unauthorized request" },
} as const;

// Combine all error types
export const RPC_ERRORS = {
    ...STANDARD_ERRORS,
    ...ENTRYPOINT_ERRORS,
    ...BUNDLER_ERRORS,
    ...SECURITY_ERRORS,
} as const;

export type RPCErrorCode = typeof RPC_ERRORS[keyof typeof RPC_ERRORS]["code"];
export type RPCErrorMessage = typeof RPC_ERRORS[keyof typeof RPC_ERRORS]["message"];

export interface RPCErrorData {
    [key: string]: unknown;
}

interface RPCErrorResponse {
    jsonrpc: "2.0";
    error: {
        code: RPCErrorCode;
        message: string;
        data?: RPCErrorData;
    };
    id: null;
}

export class RPCError extends Error {
    constructor(
        public code: RPCErrorCode,
        message: string,
        public data?: RPCErrorData
    ) {
        super(message);
        this.name = 'RPCError';
        Object.setPrototypeOf(this, RPCError.prototype);
    }

    toJSON(): RPCErrorResponse {
        const response: RPCErrorResponse = {
            jsonrpc: "2.0",
            error: {
                code: this.code,
                message: this.message,
            },
            id: null
        };

        if (this.data) {
            response.error.data = this.data;
        }

        return response;
    }

    static isRPCError(error: unknown): error is RPCError {
        return error instanceof RPCError;
    }

    private static readonly ERROR_MAPPINGS: ReadonlyMap<string, RPCErrorCode> = new Map([
        ['nonce too low', RPC_ERRORS.NONCE_TOO_LOW.code],
        ['replacement transaction underpriced', RPC_ERRORS.REPLACEMENT_UNDERPRICED.code],
        ['insufficient funds', RPC_ERRORS.INSUFFICIENT_BALANCE.code],
    ]);

    static fromError(error: Error, defaultCode: RPCErrorCode = RPC_ERRORS.INTERNAL_ERROR.code): RPCError {
        if (RPCError.isRPCError(error)) {
            return error;
        }

        for (const [errorMessage, errorCode] of this.ERROR_MAPPINGS) {
            if (error.message.toLowerCase().includes(errorMessage)) {
                return new RPCError(errorCode, error.message);
            }
        }

        return new RPCError(defaultCode, error.message);
    }
} 