/**
 * @description This file contain a middleware to check if user is admin or not
 * @author {Deo Sbrn}
 */

import { NextFunction, Response } from 'express';
import IRequest from '../../interfaces/i-request';
import { resFailed } from '../helpers/response.helper';

/**
 * Middleware to check if user is admin
 * @param {IRequest} req - Request express object
 * @param {Response} res - Response express object
 * @param {NextFunction} next - Next express function
 * @returns {Promise<void | Response>} - Promise object of void or Response
 */
export default async function isAdmin(req: IRequest, res: Response, next: NextFunction): Promise<void | Response> {
    if (req.user?.role.toLowerCase() === 'admin') {
        next();
        return;
    }

    return resFailed(res, 403, 'Forbidden');
}
