import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { sendHandleOps } from './services/TransactionService';
import { UserOperation } from './types/UserOperation';
import { rpcLimiter, healthLimiter } from './middleware/rateLimiter';
import { handleEthSendUserOperation } from './rpc-handlers';
import { RPCError, RPC_ERRORS } from './types/ErrorTypes';
import { PORT } from './config/environment';

const app = express();
const serverPort = PORT || 3001;

const corsOptions = {
    origin: '*',
    methods: ['POST', 'GET'],
    allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', healthLimiter, (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// RPC endpoint handler
app.post('/', rpcLimiter, async (req, res) => {
    try {
        const { method, params, id } = req.body;

        if (!method || !params || !id) {
            throw new RPCError(RPC_ERRORS.INVALID_REQUEST.code, 'Invalid JSON-RPC request');
        }

        let result;
        switch (method) {
            case 'eth_sendUserOperation':
                if (!Array.isArray(params) || params.length !== 2) {
                    throw new RPCError(RPC_ERRORS.INVALID_PARAMS.code, 'Invalid params for eth_sendUserOperation');
                }
                const [userOp] = params;
                result = await handleEthSendUserOperation(userOp);
                break;
            default:
                throw new RPCError(RPC_ERRORS.METHOD_NOT_FOUND.code, `Method ${method} not supported`);
        }

        res.json({ jsonrpc: '2.0', result, id });
    } catch (error) {
        handleError(error as Error, req, res);
    }
});

// Error handler
const handleError = (error: Error, req: express.Request, res: express.Response) => {
    console.error('Error processing request:', error);
    
    if (error instanceof RPCError) {
        return res.status(400).json({
            jsonrpc: '2.0',
            error: {
                code: error.code,
                message: error.message,
                data: error.data
            },
            id: req.body?.id || null
        });
    }

    const rpcError = new RPCError(RPC_ERRORS.INTERNAL_ERROR.code, 'Internal server error');
    res.status(500).json({
        jsonrpc: '2.0',
        error: {
            code: rpcError.code,
            message: rpcError.message
        },
        id: req.body?.id || null
    });
};

// Server startup with port retry
const startServer = async (port: number): Promise<void> => {
    try {
        app.listen(port, () => {
            console.log(`Bundler running on port ${port}`);
        });
    } catch (error) {
        const err = error as NodeJS.ErrnoException;
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying ${port + 1}...`);
            await startServer(port + 1);
        } else {
            console.error('Error starting server:', error);
            process.exit(1);
        }
    }
};

startServer(Number(serverPort));

export { sendHandleOps, UserOperation };