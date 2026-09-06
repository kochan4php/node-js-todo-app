import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import { MAX_TODOS } from '../../config/app.ts';
import type { Todo } from '../../interfaces/todo.ts';
import { logger } from '../../logger/index.ts';
import { sanitizeDue, sanitizeName, sanitizePriority } from '../helpers/validate.ts';
import { readTodos, writeTodos } from '../store/todo.store.ts';

/* 1030 — cadangan manual: unduh salinan JSON dari seluruh data. */
function exportData(_req: Request, res: Response) {
    res.set('Content-Disposition', 'attachment; filename="todos.json"');
    res.set('Cache-Control', 'no-store');
    res.type('application/json').json(readTodos());
}

function badRequest(res: Response, message: string) {
    res.status(400).json({ success: false, message, data: {} });
}

/* 1030 — pemulihan: ganti seluruh data dari JSON yang pernah diekspor. */
function importData(req: Request, res: Response) {
    const body: unknown = req.body;
    if (!Array.isArray(body)) return badRequest(res, 'Format salah: kirim array JSON (isi berkas todos.json).');

    const items = body as unknown[];
    if (items.length > MAX_TODOS) return badRequest(res, `Maksimal ${MAX_TODOS} rencana per impor.`);

    const now = new Date().toISOString();
    const todos: Todo[] = [];
    for (const raw of items) {
        if (raw === null || typeof raw !== 'object') return badRequest(res, 'Ada baris rencana yang tidak valid.');
        const item = raw as Record<string, unknown>;
        const name = sanitizeName(item.name);
        if (!name) return badRequest(res, 'Ada rencana tanpa nama yang valid.');

        todos.push({
            id: typeof item.id === 'string' && item.id.length <= 36 ? item.id : randomUUID(),
            name,
            completed: typeof item.completed === 'boolean' ? item.completed : false,
            createdAt: typeof item.createdAt === 'string' && item.createdAt ? item.createdAt : now,
            updatedAt: typeof item.updatedAt === 'string' && item.updatedAt ? item.updatedAt : now,
            priority: sanitizePriority(item.priority),
            due: sanitizeDue(item.due),
        });
    }

    writeTodos(todos);
    logger.info(`Impor ${todos.length} rencana`);
    res.json({ success: true, message: `${todos.length} rencana diimpor.`, data: { imported: todos.length } });
}

export default { exportData, importData };
