import type { Request, Response } from 'express';
import { render } from '../helpers/render.js';
import * as TodoService from '../services/todo.service.js';

function sanitize(value: unknown): string {
    if (typeof value !== 'string') return '';
    return value.trim().replace(/\s+/g, ' ').slice(0, 200);
}

function index(_: Request, res: Response) {
    const todos = TodoService.getAll();
    return render(res, 'index', { title: 'Daftar Rencana', layout: 'layouts/main', todos });
}

function addForm(_: Request, res: Response) {
    return render(res, 'add-todo', { title: 'Tambah Rencana', layout: 'layouts/main' });
}

function store(req: Request, res: Response) {
    const name = sanitize(req.body.name);

    if (!name) {
        return render(res, 'add-todo', {
            title: 'Tambah Rencana',
            layout: 'layouts/main',
            error: 'Rencana tidak boleh kosong.',
        });
    }

    TodoService.create(name);
    return res.redirect('/');
}

function editForm(req: Request, res: Response) {
    const todo = TodoService.getById(String(req.params.id));

    if (!todo) return res.redirect('/');

    return render(res, 'edit-todo', { title: 'Ubah Rencana', layout: 'layouts/main', todo });
}

function update(req: Request, res: Response) {
    const id = String(req.body.id ?? '');
    const name = sanitize(req.body.name);
    const todo = TodoService.getById(id);

    if (!todo) return res.redirect('/');

    if (!name) {
        return render(res, 'edit-todo', {
            title: 'Ubah Rencana',
            layout: 'layouts/main',
            todo,
            error: 'Rencana tidak boleh kosong.',
        });
    }

    TodoService.update(id, name);
    return res.redirect('/');
}

function destroy(req: Request, res: Response) {
    const id = String(req.body.id ?? '');
    TodoService.remove(id);
    return res.redirect('/');
}

export default { index, addForm, store, editForm, update, destroy };
