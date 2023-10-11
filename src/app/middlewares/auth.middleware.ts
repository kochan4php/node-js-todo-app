/**
 * @description This file contain a middleware to check if user is authenticated or not
 * @author {Deo Sbrn}
 */

import { NextFunction, Response } from 'express';
import IRequest from '../../interfaces/i-request';
import { getUserPayloadFromAccessToken, verifyAccessToken } from '../../jwt/helpers/access-token.helper';
import { resFailed } from '../helpers/response.helper';
import { logger } from '../../logger';

/**
 * Middleware to check if user is authenticated
 * @param {IRequest} req - Request express object
 * @param {Response} res - Response express object
 * @param {NextFunction} next - Next express function
 * @returns {Promise<void | Response>} - Promise object of void or Response
 */
export default async function auth(req: IRequest, res: Response, next: NextFunction): Promise<void | Response> {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return resFailed(res, 401, 'Token invalid');

        try {
            await verifyAccessToken(token);
            const decoded = getUserPayloadFromAccessToken(token) as any;
            req.user = decoded;

            next();
            return;
        } catch (error: any) {
            logger.error(auth.name, error.message);
            return resFailed(res, 401, 'Token invalid');
        }
    } catch (error: any) {
        logger.error(auth.name, error.message);
        return resFailed(res, 401, 'Unauthorized');
    }
}
