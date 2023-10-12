import { Request, Response } from 'express';
import { render } from '../helpers/render';

function index(_: Request, res: Response) {
    const data = { title: '404 Not Found', layout: 'layouts/main' };
    return render(res, '404', data);
}

export default { index };
