import type { Request, Response } from 'express';
import { createdShort, todayLong } from '../helpers/date.ts';
import { render } from '../helpers/render.ts';
import { create, getAll, getById, MAX_TODOS, remove, toggle as toggleTodo, update as updateTodo } from '../services/todo.service.ts';

function sanitize(value: unknown): string {
    if (typeof value !== 'string') return '';
    return value.trim().replace(/\s+/g, ' ').slice(0, 200);
}

function statsOf(todos: Awaited<ReturnType<typeof getAll>>) {
    const completed = todos.filter((todo) => todo.completed).length;
    const active = todos.length - completed;
    const percent = todos.length === 0 ? 0 : Math.round((completed / todos.length) * 100);
    return { total: todos.length, active, completed, percent };
}

function flashOf(req: Request): string {
    const value = String(req.query.flash ?? '');
    return ['created', 'updated', 'deleted', 'toggled', 'invalid', 'full'].includes(value) ? value : '';
}

function index(req: Request, res: Response) {
    const todos = getAll();
    return render(res, 'index', {
        title: 'Apa rencanamu hari ini?',
        layout: 'layouts/main',
        todos,
        stats: statsOf(todos),
        fmtShort: createdShort,
        today: todayLong(),
        flash: flashOf(req),
        maxTodos: MAX_TODOS,
    });
}

function addForm(_: Request, res: Response) {
    return render(res, 'add-todo', {
        title: 'Tambah Rencana',
        layout: 'layouts/main',
        today: todayLong(),
        maxTodos: MAX_TODOS,
    });
}

function store(req: Request, res: Response) {
    const name = sanitize(req.body.name);

    if (!name) {
        return render(res, 'add-todo', {
            title: 'Tambah Rencana',
            layout: 'layouts/main',
            today: todayLong(),
            maxTodos: MAX_TODOS,
            error: 'Rencana tidak boleh kosong.',
            old: name,
        });
    }

    const todo = create(name);
    if (!todo) {
        return render(res, 'add-todo', {
            title: 'Tambah Rencana',
            layout: 'layouts/main',
            today: todayLong(),
            maxTodos: MAX_TODOS,
            error: `Batas ${MAX_TODOS} rencana tercapai. Hapus sebagian dulu untuk menambah.`,
            old: name,
        });
    }

    return res.redirect('/?flash=created');
}

function editForm(req: Request, res: Response) {
    const todo = getById(String(req.params.id));

    if (!todo) return res.redirect('/?flash=invalid');

    return render(res, 'edit-todo', {
        title: 'Ubah Rencana',
        layout: 'layouts/main',
        todo,
        today: todayLong(),
        maxTodos: MAX_TODOS,
    });
}

function update(req: Request, res: Response) {
    const id = String(req.body.id ?? '');
    const name = sanitize(req.body.name);
    const todo = getById(id);

    if (!todo) return res.redirect('/?flash=invalid');

    if (!name) {
        return render(res, 'edit-todo', {
            title: 'Ubah Rencana',
            layout: 'layouts/main',
            todo,
            today: todayLong(),
            maxTodos: MAX_TODOS,
            error: 'Rencana tidak boleh kosong.',
        });
    }

    updateTodo(id, name);
    return res.redirect('/?flash=updated');
}

function toggle(req: Request, res: Response) {
    const id = String(req.params.id);
    if (!toggleTodo(id)) return res.redirect('/?flash=invalid');
    return res.redirect('/?flash=toggled');
}

function destroy(req: Request, res: Response) {
    if (!remove(String(req.body.id ?? ''))) return res.redirect('/?flash=invalid');
    return res.redirect('/?flash=deleted');
}

export default { index, addForm, store, editForm, update, toggle, destroy };
