import type { Priority, Recurrence, Subtask } from '../../interfaces/todo.ts';

const PRIORITIES: readonly string[] = ['low', 'medium', 'high'];
const RECURRENCES: readonly string[] = ['daily', 'weekly', 'monthly'];
const MAX_SUBTASKS = 20;

/* 963 — input validators that are unit-testable. */
export function sanitizeName(value: unknown): string {
    if (typeof value !== 'string') return '';
    return value.trim().replace(/\s+/g, ' ').slice(0, 200);
}

export function sanitizePriority(value: unknown): Priority | undefined {
    return typeof value === 'string' && PRIORITIES.includes(value) ? (value as Priority) : undefined;
}

/* 1040 — P0: kategori opsional, dibersihkan lalu dipotong ke 40 karakter. */
export function sanitizeCategory(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const clean = value.trim().replace(/\s+/g, ' ').slice(0, 40);
    return clean || null;
}

export function sanitizeDue(value: unknown): string | null {
    if (typeof value !== 'string' || !value) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    /* Compare UTC components: rejects impossible dates (e.g. 2023-02-30)
       which JS would silently roll over to the following month. */
    const date = new Date(Date.UTC(year, month - 1, day));
    const valid = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
    return valid ? value.trim() : null;
}

export function sanitizeNotes(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const clean = value.trim().slice(0, 2000);
    return clean || null;
}

export function sanitizeArchived(value: unknown): boolean {
    return value === true || value === 'true' || value === 1 || value === '1';
}

/* 1080 — P2: repeat whitelist; anything else (incl. empty) → no recurrence. */
export function sanitizeRepeat(value: unknown): Recurrence | null {
    return typeof value === 'string' && RECURRENCES.includes(value) ? (value as Recurrence) : null;
}

/* 1090 — P2: subtasks come in as a JSON array; each row keeps a trimmed
   text (reused name rules, cap 200) + a done flag. Array capped at 20. */
export function sanitizeSubtasks(value: unknown): Subtask[] {
    if (!Array.isArray(value)) return [];
    const out: Subtask[] = [];
    for (const row of value) {
        if (out.length >= MAX_SUBTASKS) break;
        if (row === null || typeof row !== 'object') continue;
        const item = row as Record<string, unknown>;
        const text = sanitizeName(item.text);
        if (!text) continue;
        out.push({ text, done: item.done === true });
    }
    return out;
}
