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

export function relativeWhen(iso: string): string {
    const created = new Date(iso);
    if (Number.isNaN(created.getTime())) return createdShort(iso);
    const elapsed = Date.now() - created.getTime();
    if (elapsed < 60_000) return 'baru saja';
    const mins = Math.floor(elapsed / 60_000);
    if (mins < 60) return `${mins} mnt lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} j lalu`;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const createdDay = new Date(created.getFullYear(), created.getMonth(), created.getDate());
    const days = Math.round((today.getTime() - createdDay.getTime()) / DAY_MS);
    if (days === 1) return 'kemarin';
    return createdShort(iso);
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
