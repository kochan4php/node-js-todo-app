import { Response } from 'express';

export function render(res: Response, view: string, data?: object) {
    return res.render(view, data);
}
