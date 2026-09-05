const LONG = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

const SHORT = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' });

export function todayLong(): string {
    return LONG.format(new Date());
}

export function createdShort(iso: string): string {
    return SHORT.format(new Date(iso));
}
