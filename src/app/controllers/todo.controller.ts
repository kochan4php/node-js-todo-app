import type { Request, Response } from 'express';
import { MAX_TODOS } from '../../config/app.ts';
import type { Todo } from '../../interfaces/todo.ts';
import { createdShort, dayKeyOfIso, dueInfo, last7Days, relativeWhen, streakDays, todayLong } from '../helpers/date.ts';
import { renderPartial, render as renderView } from '../helpers/render.ts';
import {
    sanitizeArchived,
    sanitizeCategory,
    sanitizeDue,
    sanitizeName,
    sanitizeNotes,
    sanitizePriority,
    sanitizeRepeat,
    sanitizeSubtasks,
} from '../helpers/validate.ts';
import {
    bulk as bulkTodos,
    create,
    getAll,
    getById,
    remove,
    reorderTodos,
    restore,
    toggleArchived as toggleArchivedTodo,
    toggle as toggleTodo,
    updateSubtask,
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
    return ['created', 'updated', 'deleted', 'toggled', 'invalid', 'full', 'restored', 'archived', 'unarchived', 'subtask'].includes(value)
        ? value
        : '';
}

/* 1120 — P2: the view state read from the URL (and honored by the server so
   no-JS and deep links render the right list). Mirrors what the client
   recomputes on load — same predicate, idempotent. */
type ViewState = { f: string; s: string; q: string; c: string };

function readView(req: Request, categories: string[]): ViewState {
    const f = req.query.f === 'active' || req.query.f === 'done' || req.query.f === 'archive' ? String(req.query.f) : 'all';
    const s = req.query.s === 'az' || req.query.s === 'za' ? String(req.query.s) : 'newest';
    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase().slice(0, 100) : '';
    const c = typeof req.query.c === 'string' && categories.includes(req.query.c) ? (req.query.c as string) : '';
    return { f, s, q, c };
}

function hiddenBy(todo: Todo, view: ViewState): boolean {
    const filterOk =
        view.f === 'archive'
            ? todo.archived
            : !todo.archived && (view.f === 'all' || (view.f === 'active' && !todo.completed) || (view.f === 'done' && todo.completed));
    if (!filterOk) return true;
    if (view.q && !todo.name.toLowerCase().includes(view.q)) return true;
    if (view.c && todo.category !== view.c) return true;
    return false;
}

/* Sort mirrors the client's applySort: done last, then A–Z / Z–A by name.
   "newest" keeps getAll()'s order (already done-last, createdAt desc). */
function viewTodos(todos: Todo[], view: ViewState): { todo: Todo; hidden: boolean }[] {
    const entries = todos.map((todo) => ({ todo, hidden: hiddenBy(todo, view) }));
    if (view.s === 'az' || view.s === 'za') {
        const dir = view.s === 'az' ? 1 : -1;
        entries.sort((a, b) => {
            const aDone = a.todo.completed ? 1 : 0;
            const bDone = b.todo.completed ? 1 : 0;
            if (aDone !== bDone) return aDone - bDone;
            return dir * a.todo.name.localeCompare(b.todo.name, 'id');
        });
    }
    return entries;
}

async function index(req: Request, res: Response) {
    const todos = await getAll();
    const stats = statsOf(todos);
    const categories = categoriesOf(todos);
    const view = readView(req, categories);
    const entries = viewTodos(todos, view);
    const visible = entries.filter((entry) => !entry.hidden);
    return renderView(res, 'index', {
        title: 'Apa rencanamu hari ini?',
        layout: 'layouts/main',
        todos,
        stats,
        categories,
        fmtShort: createdShort,
        fmtDue: dueInfo,
        fmtWhen: relativeWhen,
        today: todayLong(),
        flash: flashOf(req),
        maxTodos: MAX_TODOS,
        view,
        entries,
        visible,
        emptyFilteredHidden: visible.length !== 0,
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
    const repeat = sanitizeRepeat(req.body.repeat);
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
            oldRepeat: repeat,
        });
    }

    const todo = await create(name, priority, due, category, notes, repeat);
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
            oldRepeat: repeat,
        });
    }

    if (wantsJson) {
        return res.json({
            ok: true,
            todo,
            html: await renderPartial('partials/todo-item', { todo, fmtDue: dueInfo, fmtWhen: relativeWhen, selectable: true }),
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
    const repeat = sanitizeRepeat(req.body.repeat);
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

    await updateTodo(id, name, priority, due, category, notes, repeat);
    return res.redirect('/?flash=updated');
}

async function toggle(req: Request, res: Response) {
    const id = String(req.params.id);
    const result = await toggleTodo(id);
    if (!result) return res.redirect('/?flash=invalid');

    /* 1080 — P2: JSON clients also get the spawned next occurrence (if any). */
    if (req.accepts(['html', 'json']) === 'json') {
        return res.json({
            ok: true,
            todo: result.todo,
            next: result.next
                ? {
                      id: result.next.id,
                      html: await renderPartial('partials/todo-item', {
                          todo: result.next,
                          fmtDue: dueInfo,
                          fmtWhen: relativeWhen,
                          selectable: true,
                      }),
                  }
                : null,
        });
    }
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

function parseJson(value: unknown): unknown {
    if (typeof value !== 'string' || !value) return null;
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
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
        repeat: sanitizeRepeat(req.body.repeat),
        subtasks: sanitizeSubtasks(parseJson(req.body.subtasks)),
    });

    if (!todo) return res.redirect('/?flash=full');

    if (req.accepts(['html', 'json']) === 'json') {
        return res.json({ ok: true, todo });
    }
    return res.redirect('/?flash=restored');
}

/* 1090 — P2: one endpoint mutates the embedded subtask checklist. The form
   variants (no JS) redirect back to the editor; fetch gets a re-rendered
   rows block so the list page and the editor stay in sync. */
const SUBTASK_ACTIONS: readonly string[] = ['add', 'toggle', 'remove'];

async function subtasks(req: Request, res: Response) {
    const id = String(req.body?.id ?? '');
    const action = String(req.body?.action ?? '');
    if (!SUBTASK_ACTIONS.includes(action)) return res.redirect('/?flash=invalid');

    const index = action === 'add' ? undefined : Number(req.body?.index);
    const text = action === 'add' ? String(req.body?.text ?? '') : undefined;
    const todo = await updateSubtask(id, action as 'add' | 'toggle' | 'remove', index, text);
    if (!todo) return res.redirect('/?flash=invalid');

    if (req.accepts(['html', 'json']) === 'json') {
        return res.json({
            ok: true,
            todo,
            html: await renderPartial('partials/subtask-rows', {
                subtasks: todo.subtasks,
                id: todo.id,
                mode: req.body?.mode === 'edit' ? 'edit' : 'list',
            }),
        });
    }
    return res.redirect(`/edit-todo/${id}?flash=subtask`);
}

/* 1100 — P2: bulk complete/archive/delete. Body: { ids, action }. */
async function bulk(req: Request, res: Response) {
    const action = String(req.body?.action ?? '');
    if (action !== 'complete' && action !== 'archive' && action !== 'delete') {
        return res.status(400).json({ ok: false, error: 'Aksi tidak valid.' });
    }
    const raw = req.body?.ids;
    const ids = Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string' && id !== '') : [];
    if (!ids.length) return res.status(400).json({ ok: false, error: 'Tidak ada rencana dipilih.' });
    const processed = await bulkTodos([...new Set(ids)], action);
    return res.json({ ok: true, processed });
}

/* 1040 — P0: persist drag-and-drop order. Body: { ids: [...]. } */
async function reorder(req: Request, res: Response) {
    const raw = req.body?.ids;
    const ids = Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string') : [];
    const updated = await reorderTodos(ids);
    if (updated === 0) return res.status(400).json({ ok: false, error: 'Tidak ada urutan valid.' });
    return res.json({ ok: true, updated });
}

export default { index, addForm, store, editForm, update, toggle, archive, destroy, restoreTodo, reorder, subtasks, bulk };
