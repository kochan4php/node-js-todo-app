import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { DATA_FILE } from '../../config/app.ts';
import type { Todo } from '../../interfaces/todo.ts';
import { logger } from '../../logger/index.ts';

function ensureDefaults(todos: Todo[]): Todo[] {
    const now = new Date().toISOString();
    return todos.map((todo, index) => ({
        id: todo.id || String(index + 1),
        name: todo.name,
        completed: todo.completed ?? false,
        createdAt: todo.createdAt || now,
        updatedAt: todo.updatedAt || now,
        priority: todo.priority,
        due: todo.due ?? null,
    }));
}

/* 619 — muat JSON sekali ke memori; simpan ulang per mutasi (atomic, 596/598). */
let buffer: Todo[] | null = null;

export function readTodos(): Todo[] {
    if (buffer) return buffer;
    try {
        const parsed: unknown = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
        buffer = Array.isArray(parsed) ? ensureDefaults(parsed as Todo[]) : [];
    } catch (error) {
        const err = error as NodeJS.ErrnoException;
        if (err.code === 'ENOENT') {
            /* 677/812 — seed otomatis: buat file kosong di run pertama. */
            writeTodos(buffer ?? []);
            return buffer as Todo[];
        }
        /* 813 — JSON korup: backup .bak lalu mulai dari kosong. */
        try {
            renameSync(DATA_FILE, `${DATA_FILE}.bak`);
            logger.warn(`Data rusak, dicadangkan ke .bak: ${err.message}`);
        } catch {
            /* backup gagal — tetap lanjut dari awal */
        }
        buffer = [];
    }
    return buffer;
}

export function writeTodos(todos: Todo[]): void {
    mkdirSync(dirname(DATA_FILE), { recursive: true });
    const tempFile = `${DATA_FILE}.tmp`;
    writeFileSync(tempFile, JSON.stringify(todos, null, 2), 'utf8');
    renameSync(tempFile, DATA_FILE);
    buffer = todos;
}
