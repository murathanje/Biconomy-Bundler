import rateLimit from 'express-rate-limit';
import { RPCError, RPC_ERRORS } from '../types/ErrorTypes';

const errorHandler = (req: any, res: any): void => {
    throw new RPCError(
        RPC_ERRORS.RATE_LIMITED.code,
        'Too many requests, please try again later',
        {
            windowMs: req.rateLimit.windowMs,
            maxRequests: req.rateLimit.limit,
            remainingRequests: req.rateLimit.remaining,
            resetTime: new Date(Date.now() + req.rateLimit.resetTime).toISOString()
        }
    );
};

export const rpcLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: undefined,
    handler: errorHandler,
    legacyHeaders: false,
    standardHeaders: true,
    keyGenerator: (req) => {
        return req.ip || req.connection.remoteAddress || 'unknown';
    }
});

export const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: undefined,
    handler: errorHandler,
    legacyHeaders: false,
    standardHeaders: true
});

export const healthLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
    message: undefined,
    handler: errorHandler,
    legacyHeaders: false,
    standardHeaders: true
});