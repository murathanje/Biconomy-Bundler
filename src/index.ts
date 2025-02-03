import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { sendHandleOps } from './services/TransactionService';
import { UserOperation } from './types/UserOperation';
import { config } from 'dotenv';
import { rpcLimiter, healthLimiter } from './middleware/rateLimiter';
import { handleEthSendUserOperation } from './rpc-handlers';
import { RPCError, RPC_ERRORS } from './types/ErrorTypes';

config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', healthLimiter, (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/', rpcLimiter, async (req, res) => {
    try {
        const { method, params, id } = req.body;

        if (!method || !params || !id) {
            throw new RPCError(
                RPC_ERRORS.INVALID_REQUEST.code,
                'Invalid JSON-RPC request'
            );
        }

        let result;
        switch (method) {
            case 'eth_sendUserOperation':
                result = await handleEthSendUserOperation(params);
                break;
            default:
                throw new RPCError(
                    RPC_ERRORS.METHOD_NOT_FOUND.code,
                    `Method ${method} not supported`
                );
        }

        res.json({
            jsonrpc: '2.0',
            result,
            id
        });
    } catch (error) {
        if (error instanceof RPCError) {
            res.status(400).json(error.toJSON());
        } else {
            const rpcError = new RPCError(
                RPC_ERRORS.INTERNAL_ERROR.code,
                'Internal server error'
            );
            res.status(500).json(rpcError.toJSON());
        }
    }
});

app.listen(PORT, () => {
    console.log(`Bundler running on port ${PORT}`);
});

export { sendHandleOps, UserOperation };