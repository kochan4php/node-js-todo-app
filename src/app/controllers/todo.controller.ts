import type { Request, Response } from 'express';
import { MAX_TODOS } from '../../config/app.ts';
import { createdShort, dueInfo, relativeWhen, todayLong } from '../helpers/date.ts';
import { render } from '../helpers/render.ts';
import { sanitizeDue, sanitizeName, sanitizePriority } from '../helpers/validate.ts';
import { create, getAll, getById, remove, restore, toggle as toggleTodo, update as updateTodo } from '../services/todo.service.ts';

function statsOf(todos: Awaited<ReturnType<typeof getAll>>) {
    const completed = todos.filter((todo) => todo.completed).length;
    const active = todos.length - completed;
    const percent = todos.length === 0 ? 0 : Math.round((completed / todos.length) * 100);
    return { total: todos.length, active, completed, percent };
}

function flashOf(req: Request): string {
    const value = String(req.query.flash ?? '');
    return ['created', 'updated', 'deleted', 'toggled', 'invalid', 'full', 'restored'].includes(value) ? value : '';
}

function index(req: Request, res: Response) {
    const todos = getAll();
    return render(res, 'index', {
        title: 'Apa rencanamu hari ini?',
        layout: 'layouts/main',
        todos,
        stats: statsOf(todos),
        fmtShort: createdShort,
        fmtDue: dueInfo,
        fmtWhen: relativeWhen,
        today: todayLong(),
        flash: flashOf(req),
        maxTodos: MAX_TODOS,
    });
}

function addForm(_: Request, res: Response) {
    return render(res, 'add-todo', {
        title: 'Tambah Rencana',
        description: 'Tambahkan rencana baru ke buku rencanamu — ringkas, jelas, maksimal 200 karakter.',
        layout: 'layouts/main',
        today: todayLong(),
        maxTodos: MAX_TODOS,
    });
}

function store(req: Request, res: Response) {
    const name = sanitizeName(req.body.name);
    const priority = sanitizePriority(req.body.priority);
    const due = sanitizeDue(req.body.due);

    if (!name) {
        return render(res, 'add-todo', {
            title: 'Tambah Rencana',
            description: 'Tambahkan rencana baru ke buku rencanamu — ringkas, jelas, maksimal 200 karakter.',
            layout: 'layouts/main',
            today: todayLong(),
            maxTodos: MAX_TODOS,
            error: 'Rencana tidak boleh kosong.',
            old: name,
            oldPriority: priority,
            oldDue: due,
        });
    }

    const todo = create(name, priority, due);
    if (!todo) {
        return render(res, 'add-todo', {
            title: 'Tambah Rencana',
            description: 'Tambahkan rencana baru ke buku rencanamu — ringkas, jelas, maksimal 200 karakter.',
            layout: 'layouts/main',
            today: todayLong(),
            maxTodos: MAX_TODOS,
            error: `Batas ${MAX_TODOS} rencana tercapai. Hapus sebagian dulu untuk menambah.`,
            old: name,
            oldPriority: priority,
            oldDue: due,
        });
    }

    return res.redirect('/?flash=created');
}

function editForm(req: Request, res: Response) {
    const todo = getById(String(req.params.id));

    if (!todo) return res.redirect('/?flash=invalid');

    return render(res, 'edit-todo', {
        title: 'Ubah Rencana',
        description: 'Ubah nama, prioritas, dan tenggat rencana yang sudah kamu catat.',
        layout: 'layouts/main',
        todo,
        today: todayLong(),
        maxTodos: MAX_TODOS,
    });
}

function update(req: Request, res: Response) {
    const id = String(req.body.id ?? '');
    const name = sanitizeName(req.body.name);
    const priority = sanitizePriority(req.body.priority);
    const due = sanitizeDue(req.body.due);
    const todo = getById(id);

    if (!todo) return res.redirect('/?flash=invalid');

    if (!name) {
        return render(res, 'edit-todo', {
            title: 'Ubah Rencana',
            description: 'Ubah nama, prioritas, dan tenggat rencana yang sudah kamu catat.',
            layout: 'layouts/main',
            todo,
            today: todayLong(),
            maxTodos: MAX_TODOS,
            error: 'Rencana tidak boleh kosong.',
        });
    }

    updateTodo(id, name, priority, due);
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

function restoreTodo(req: Request, res: Response) {
    const todo = restore({
        name: sanitizeName(req.body.name),
        completed: req.body.completed === 'true',
        createdAt: String(req.body.createdAt ?? ''),
        priority: sanitizePriority(req.body.priority),
        due: sanitizeDue(req.body.due),
    });

    if (!todo) return res.redirect('/?flash=full');

    if (req.accepts(['html', 'json']) === 'json') {
        return res.json({ ok: true, todo });
    }
    return res.redirect('/?flash=restored');
}

export default { index, addForm, store, editForm, update, toggle, destroy, restoreTodo };
