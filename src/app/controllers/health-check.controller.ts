import type { Request, Response } from 'express';
import { resSuccess } from '../helpers/response.helper.ts';

function healthCheck(_: Request, res: Response): Response {
    const health = {
        status: 'UP',
        uptime: process.uptime(),
        timestamp: Date.now(),
    };

    return resSuccess(res, 200, 'Health check success', health);
}

export default { healthCheck };
