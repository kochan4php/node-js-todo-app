/**
 * @description This file contain all routes for health check endpoints
 * @author {Deo Sbrn}
 */

import { Request, Response } from 'express';
import { resSuccess } from '../helpers';
import { logger } from '../../logger';

/**
 * @description This function will check health of the application
 * @param {Request} _ - Express Request object
 * @param {Response} res - Express Response object
 * @returns {Promise<Response>} - Promise object of Express Response
 */
function healthCheck(_: Request, res: Response): Response {
    const health = {
        status: 'UP',
        uptime: process.uptime(),
        timestamp: Date.now(),
    };

    try {
        return resSuccess(res, 200, 'Health check success', health);
    } catch (error: any) {
        logger.error(healthCheck.name, error.message);
        return resSuccess(res, 500, error.message);
    }
}

export default { healthCheck };
