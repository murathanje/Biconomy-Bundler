import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { sendHandleOps } from './ethereum';
import { UserOperation } from './types';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req: express.Request, res: express.Response) => {
    res.status(200).json({ status: 'healthy' });
});

app.post('/', async (req: express.Request, res: express.Response) => {
    try {
        const { jsonrpc, method, params, id } = req.body;

        if (jsonrpc !== '2.0' || method !== 'eth_sendUserOperation') {
            return res.status(400).json({
                jsonrpc: '2.0',
                id,
                error: {
                    code: -32601,
                    message: 'Method not found'
                }
            });
        }

        const [userOp, entryPoint] = params;
        const hash = await sendHandleOps(userOp as UserOperation);

        res.json({
            jsonrpc: '2.0',
            result: hash,
            id
        });
    } catch (error: any) {
        if (error.code === -32603) {
            console.error('Internal server error:', error);
        }

        if (error.toJSON) {
            return res.json({
                jsonrpc: '2.0',
                ...error.toJSON(),
                id: req.body.id
            });
        }

        res.status(500).json({
            jsonrpc: '2.0',
            id: req.body.id,
            error: {
                code: -32603,
                message: error.message || 'Internal server error'
            }
        });
    }
});

app.listen(PORT, () => {
    console.log(`Bundler running on port ${PORT}`);
});