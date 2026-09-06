import type { Request, Response } from 'express';
import { MAX_TODOS } from '../../config/app.ts';
import { logger } from '../../logger/index.ts';
import { sanitizeDue, sanitizeName, sanitizePriority } from '../helpers/validate.ts';
import { getAll, importTodos } from '../services/todo.service.ts';

/* 1030 — manual backup: download a JSON copy of all data. */
async function exportData(_req: Request, res: Response) {
    res.set('Content-Disposition', 'attachment; filename="todos.json"');
    res.set('Cache-Control', 'no-store');
    res.type('application/json').json(await getAll());
}

function badRequest(res: Response, message: string) {
    res.status(400).json({ success: false, message, data: {} });
}

/* 1030 — restore: replace all data from a previously exported JSON. */
async function importData(req: Request, res: Response) {
    const body: unknown = req.body;
    if (!Array.isArray(body)) return badRequest(res, 'Format salah: kirim array JSON (isi berkas todos.json).');

    const items = body as unknown[];
    if (items.length > MAX_TODOS) return badRequest(res, `Maksimal ${MAX_TODOS} rencana per impor.`);

    const imports: Parameters<typeof importTodos>[0] = [];
    for (const raw of items) {
        if (raw === null || typeof raw !== 'object') return badRequest(res, 'Ada baris rencana yang tidak valid.');
        const item = raw as Record<string, unknown>;
        const name = sanitizeName(item.name);
        if (!name) return badRequest(res, 'Ada rencana tanpa nama yang valid.');

        const createdAt = typeof item.createdAt === 'string' && item.createdAt ? new Date(item.createdAt) : undefined;
        const updatedAt = typeof item.updatedAt === 'string' && item.updatedAt ? new Date(item.updatedAt) : undefined;
        imports.push({
            name,
            completed: typeof item.completed === 'boolean' ? item.completed : false,
            createdAt,
            updatedAt,
            priority: sanitizePriority(item.priority),
            due: sanitizeDue(item.due),
        });
    }

    await importTodos(imports);
    logger.info(`Imported ${imports.length} todos`);
    res.json({ success: true, message: `${imports.length} rencana diimpor.`, data: { imported: imports.length } });
}

export default { exportData, importData };
