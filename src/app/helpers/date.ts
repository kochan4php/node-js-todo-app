const LONG = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

const SHORT = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' });

const DAY_MS = 86_400_000;

export function todayLong(): string {
    return LONG.format(new Date());
}

export function createdShort(iso: string): string {
    return SHORT.format(new Date(iso));
}

export function dueInfo(iso: string, completed: boolean): { label: string; state: string } {
    const due = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(due.getTime())) return { label: iso, state: '' };
    if (completed) return { label: SHORT.format(due), state: '' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((due.getTime() - today.getTime()) / DAY_MS);

    if (diff === 0) return { label: 'Hari ini', state: 'is-today' };
    if (diff === 1) return { label: 'Besok', state: '' };
    if (diff < 0) return { label: `Terlewat ${-diff} hari`, state: 'is-overdue' };
    return { label: SHORT.format(due), state: '' };
}
