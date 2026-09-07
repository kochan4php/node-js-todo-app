import type { Request, Response } from 'express';
import { MAX_TODOS } from '../../config/app.ts';
import type { Todo } from '../../interfaces/todo.ts';
import { createdShort, dayKeyOfIso, dueInfo, last7Days, relativeWhen, streakDays, todayLong } from '../helpers/date.ts';
import { renderPartial, render as renderView } from '../helpers/render.ts';
import { sanitizeArchived, sanitizeCategory, sanitizeDue, sanitizeName, sanitizeNotes, sanitizePriority } from '../helpers/validate.ts';
import {
    create,
    getAll,
    getById,
    remove,
    reorderTodos,
    restore,
    toggleArchived as toggleArchivedTodo,
    toggle as toggleTodo,
    update as updateTodo,
} from '../services/todo.service.ts';

function statsOf(todos: Todo[]) {
    /* 1070 — archived plans are "retired": they leave the ledger entirely and
       only show under the Arsip filter. */
    const live = todos.filter((todo) => !todo.archived);
    const completed = live.filter((todo) => todo.completed).length;
    const active = live.length - completed;
    const percent = live.length === 0 ? 0 : Math.round((completed / live.length) * 100);

    /* 1040 — P0: per-day completion counts for the 7-day chart + streak. */
    const countByDay = new Map<string, number>();
    for (const todo of live) {
        if (!todo.completedAt) continue;
        const key = dayKeyOfIso(todo.completedAt);
        if (key) countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
    }
    const week = last7Days();
    const maxCount = Math.max(1, ...week.map((day) => countByDay.get(day.key) ?? 0));
    const chart = week.map((day) => {
        const count = countByDay.get(day.key) ?? 0;
        return { ...day, count, bar: count ? Math.max(0.1, count / maxCount) : 0, isZero: count === 0 };
    });
    const weekLabel = `7 hari terakhir — ${chart.map((day) => `${day.full}: ${day.count} selesai`).join('; ')}`;

    return {
        total: live.length,
        active,
        completed,
        percent,
        archived: todos.length - live.length,
        week: chart,
        weekLabel,
        streak: streakDays(countByDay, dayKeyOfIso(new Date().toISOString())),
    };
}

function categoriesOf(todos: Todo[]): string[] {
    return [...new Set(todos.map((todo) => todo.category).filter((c): c is string => Boolean(c)))].sort((a, b) => a.localeCompare(b, 'id'));
}

function flashOf(req: Request): string {
    const value = String(req.query.flash ?? '');
    return ['created', 'updated', 'deleted', 'toggled', 'invalid', 'full', 'restored', 'archived', 'unarchived'].includes(value)
        ? value
        : '';
}

async function index(req: Request, res: Response) {
    const todos = await getAll();
    return renderView(res, 'index', {
        title: 'Apa rencanamu hari ini?',
        layout: 'layouts/main',
        todos,
        stats: statsOf(todos),
        categories: categoriesOf(todos),
        fmtShort: createdShort,
        fmtDue: dueInfo,
        fmtWhen: relativeWhen,
        today: todayLong(),
        flash: flashOf(req),
        maxTodos: MAX_TODOS,
    });
}

async function addForm(_: Request, res: Response) {
    return renderView(res, 'add-todo', {
        title: 'Tambah Rencana',
        description: 'Tambahkan rencana baru ke buku rencanamu — ringkas, jelas, maksimal 200 karakter.',
        layout: 'layouts/main',
        today: todayLong(),
        maxTodos: MAX_TODOS,
        categories: categoriesOf(await getAll()),
    });
}

async function store(req: Request, res: Response) {
    const name = sanitizeName(req.body.name);
    const priority = sanitizePriority(req.body.priority);
    const due = sanitizeDue(req.body.due);
    const category = sanitizeCategory(req.body.category);
    const notes = sanitizeNotes(req.body.notes);
    /* 1040 — P0: the quick-add form posts with Accept: application/json. */
    const wantsJson = req.accepts(['html', 'json']) === 'json';
    const addFormData = {
        title: 'Tambah Rencana',
        description: 'Tambahkan rencana baru ke buku rencanamu — ringkas, jelas, maksimal 200 karakter.',
        layout: 'layouts/main',
        today: todayLong(),
        maxTodos: MAX_TODOS,
        categories: categoriesOf(await getAll()),
    };

    if (!name) {
        if (wantsJson) return res.status(400).json({ ok: false, error: 'Rencana tidak boleh kosong.' });
        return renderView(res, 'add-todo', {
            ...addFormData,
            error: 'Rencana tidak boleh kosong.',
            old: name,
            oldPriority: priority,
            oldDue: due,
            oldCategory: category,
            oldNotes: notes,
        });
    }

    const todo = await create(name, priority, due, category, notes);
    if (!todo) {
        if (wantsJson) return res.status(400).json({ ok: false, error: `Batas ${MAX_TODOS} rencana tercapai.` });
        return renderView(res, 'add-todo', {
            ...addFormData,
            error: `Batas ${MAX_TODOS} rencana tercapai. Hapus sebagian dulu untuk menambah.`,
            old: name,
            oldPriority: priority,
            oldDue: due,
            oldCategory: category,
            oldNotes: notes,
        });
    }

    if (wantsJson) {
        return res.json({
            ok: true,
            todo,
            html: await renderPartial('partials/todo-item', { todo, fmtDue: dueInfo, fmtWhen: relativeWhen }),
        });
    }
    return res.redirect('/?flash=created');
}

async function editForm(req: Request, res: Response) {
    const todo = await getById(String(req.params.id));

    if (!todo) return res.redirect('/?flash=invalid');

    return renderView(res, 'edit-todo', {
        title: 'Ubah Rencana',
        description: 'Ubah nama, prioritas, dan tenggat rencana yang sudah kamu catat.',
        layout: 'layouts/main',
        todo,
        fmtDue: dueInfo,
        today: todayLong(),
        maxTodos: MAX_TODOS,
        categories: categoriesOf(await getAll()),
    });
}

async function update(req: Request, res: Response) {
    const id = String(req.body.id ?? '');
    const name = sanitizeName(req.body.name);
    const priority = sanitizePriority(req.body.priority);
    const due = sanitizeDue(req.body.due);
    const category = sanitizeCategory(req.body.category);
    const notes = sanitizeNotes(req.body.notes);
    const todo = await getById(id);

    if (!todo) return res.redirect('/?flash=invalid');

    if (!name) {
        return renderView(res, 'edit-todo', {
            title: 'Ubah Rencana',
            description: 'Ubah nama, prioritas, dan tenggat rencana yang sudah kamu catat.',
            layout: 'layouts/main',
            todo,
            fmtDue: dueInfo,
            today: todayLong(),
            maxTodos: MAX_TODOS,
            categories: categoriesOf(await getAll()),
            error: 'Rencana tidak boleh kosong.',
            oldNotes: req.body.notes,
        });
    }

    await updateTodo(id, name, priority, due, category, notes);
    return res.redirect('/?flash=updated');
}

async function toggle(req: Request, res: Response) {
    const id = String(req.params.id);
    if (!(await toggleTodo(id))) return res.redirect('/?flash=invalid');
    return res.redirect('/?flash=toggled');
}

/* 1070 — arsip: put a plan away without deleting it. Undo-able via the
   Arsip filter + the same route (un-archive). */
async function archive(req: Request, res: Response) {
    const id = String(req.params.id);
    const todo = await toggleArchivedTodo(id);
    if (!todo) return res.redirect('/?flash=invalid');

    if (req.accepts(['html', 'json']) === 'json') {
        return res.json({ ok: true, todo });
    }
    return res.redirect(`/?flash=${todo.archived ? 'archived' : 'unarchived'}`);
}

async function destroy(req: Request, res: Response) {
    if (!(await remove(String(req.body.id ?? '')))) return res.redirect('/?flash=invalid');
    return res.redirect('/?flash=deleted');
}

async function restoreTodo(req: Request, res: Response) {
    const todo = await restore({
        name: sanitizeName(req.body.name),
        completed: req.body.completed === 'true',
        createdAt: String(req.body.createdAt ?? ''),
        priority: sanitizePriority(req.body.priority),
        due: sanitizeDue(req.body.due),
        category: sanitizeCategory(req.body.category),
        notes: sanitizeNotes(req.body.notes),
        archived: sanitizeArchived(req.body.archived),
    });

    if (!todo) return res.redirect('/?flash=full');

    if (req.accepts(['html', 'json']) === 'json') {
        return res.json({ ok: true, todo });
    }
    return res.redirect('/?flash=restored');
}

/* 1040 — P0: persist drag-and-drop order. Body: { ids: [...]. } */
async function reorder(req: Request, res: Response) {
    const raw = req.body?.ids;
    const ids = Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string') : [];
    const updated = await reorderTodos(ids);
    if (updated === 0) return res.status(400).json({ ok: false, error: 'Tidak ada urutan valid.' });
    return res.json({ ok: true, updated });
}

export default { index, addForm, store, editForm, update, toggle, archive, destroy, restoreTodo, reorder };
