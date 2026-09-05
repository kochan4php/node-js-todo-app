import type { Request, Response } from 'express';
import { resSuccess } from '../helpers/response.helper.ts';

function index(_: Request, res: Response): Response {
    return resSuccess(res, 200, 'Node.js Todo App API');
}

export default { index };
