import type { Request, Response } from 'express';
import { render } from '../helpers/render.js';

function index(_: Request, res: Response) {
    res.status(404);
    return render(res, '404', { title: '404 Not Found', layout: 'layouts/main' });
}

export default { index };
