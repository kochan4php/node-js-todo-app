import type { Request, Response } from 'express';
import { render } from '../helpers/render.ts';

function index(_: Request, res: Response) {
    res.status(404);
    /* 540 — error pages must not be indexed. */
    return render(res, '404', { title: 'Halaman tidak ditemukan', layout: 'layouts/main', robots: 'noindex, follow' });
}

export default { index };
