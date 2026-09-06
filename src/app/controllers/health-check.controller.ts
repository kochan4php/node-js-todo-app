import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { resSuccess } from '../helpers/response.helper.ts';

function healthCheck(_: Request, res: Response): Response {
    const health = {
        status: 'UP',
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: process.uptime(),
        timestamp: Date.now(),
    };

    return resSuccess(res, 200, 'Health check success', health);
}

export default { healthCheck };
