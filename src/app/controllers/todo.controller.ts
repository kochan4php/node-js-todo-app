import { Request, Response } from 'express';
import { render } from '../helpers/render';

function index(_: Request, res: Response) {
    const data = { title: 'Node JS Todo App', layout: 'layouts/mainLayout', todos: [] };
    return render(res, 'index', data);
}

export default { index };
