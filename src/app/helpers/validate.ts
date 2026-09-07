import type { Priority } from '../../interfaces/todo.ts';

const PRIORITIES: readonly string[] = ['low', 'medium', 'high'];

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
