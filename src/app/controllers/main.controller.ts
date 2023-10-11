/**
 * @description This file contain a function for control request and response from main endpoints api
 * @description It will handle all request and response from main endpoints api
 * @author {Deo Sbrn}
 */

import { Request, Response } from 'express';
import { resSuccess } from '../helpers/response.helper';

/**
 * @description Main index controller
 * @param {IRequest} _ - Express Request object
 * @param {Response} res - Express Response object
 * @returns {Promise<Response>} - Promise object of Express Response
 */
function index(_: Request, res: Response): Response {
    const message = 'Hello from Node.js + Express.js + TypeScript Starter';
    return resSuccess(res, 200, message, {
        docs: 'https://github.com/kochan4php/express-ts-starter',
    });
}

export default { index };
