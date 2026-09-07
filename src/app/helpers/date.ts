const LONG = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

const SHORT = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' });

const DATETIME = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

const DAY_MS = 86_400_000;

const WEEK_DAYS: readonly { short: string; full: string }[] = [
    { short: 'Min', full: 'Minggu' },
    { short: 'Sen', full: 'Senin' },
    { short: 'Sel', full: 'Selasa' },
    { short: 'Rab', full: 'Rabu' },
    { short: 'Kam', full: 'Kamis' },
    { short: 'Jum', full: 'Jumat' },
    { short: 'Sab', full: 'Sabtu' },
];

/* 1040 — P0: lokal "yyyy-MM-dd" dari sebuah Date (batas hari untuk chart/streak). */
function localDayKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function dayKeyOfIso(iso: string): string {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? '' : localDayKey(date);
}

/* 1040 — P0: 7 hari terakhir (hari ini di ujung kanan) untuk mini chart. */
export function last7Days(): { key: string; short: string; full: string }[] {
    const out: { key: string; short: string; full: string }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - i * DAY_MS);
        const meta = WEEK_DAYS[date.getDay()];
        out.push({ key: localDayKey(date), short: meta?.short ?? '', full: meta?.full ?? '' });
    }
    return out;
}

/* 1040 — P0: streak = hari-hari beruntun (sampai hari ini) yang punya ≥1 rencana selesai. */
export function streakDays(countByDay: Map<string, number>, todayKey: string): number {
    const yesterday = new Date(`${todayKey}T00:00:00`);
    yesterday.setDate(yesterday.getDate() - 1);
    let cursor = countByDay.has(todayKey) ? todayKey : localDayKey(yesterday);
    let streak = 0;
    while (countByDay.has(cursor)) {
        streak += 1;
        const prev = new Date(`${cursor}T00:00:00`);
        prev.setDate(prev.getDate() - 1);
        cursor = localDayKey(prev);
    }
    return streak;
}

export function todayLong(): string {
    return LONG.format(new Date());
}

export function fmtDateTime(value: string | Date): string {
    return DATETIME.format(new Date(value));
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
