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
    }));
}

export function readTodos(): Todo[] {
    try {
        const parsed: unknown = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
        return Array.isArray(parsed) ? ensureDefaults(parsed as Todo[]) : [];
    } catch (error) {
        logger.warn(`Gagal membaca data, mulai dari kosong: ${(error as Error).message}`);
        return [];
    }
}

export function writeTodos(todos: Todo[]): void {
    mkdirSync(dirname(DATA_FILE), { recursive: true });
    const tempFile = `${DATA_FILE}.tmp`;
    writeFileSync(tempFile, JSON.stringify(todos, null, 2), 'utf8');
    renameSync(tempFile, DATA_FILE);
}
