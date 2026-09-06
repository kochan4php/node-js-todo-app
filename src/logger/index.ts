type Level = 'info' | 'warn' | 'error';

/* 722 — jenjang log: info/warn di dev, hanya warn+error di produksi. */
const MIN_LEVEL: Level = process.env.NODE_ENV === 'production' ? 'warn' : 'info';
const RANK: Record<Level, number> = { info: 0, warn: 1, error: 2 };

function log(level: Level, message: unknown): void {
    if (RANK[level] < RANK[MIN_LEVEL]) return;
    const time = new Date().toISOString();
    const fn = level === 'info' ? console.log : console[level];
    fn(`[${time}] [${level.toUpperCase()}] ${message}`);
}

export const logger = {
    info: (message: unknown): void => log('info', message),
    warn: (message: unknown): void => log('warn', message),
    error: (message: unknown): void => log('error', message),
};
