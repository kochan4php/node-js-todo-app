type Level = 'info' | 'warn' | 'error';

function log(level: Level, message: unknown): void {
    const time = new Date().toISOString();
    const fn = level === 'info' ? console.log : console[level];
    fn(`[${time}] [${level.toUpperCase()}] ${message}`);
}

export const logger = {
    info: (message: unknown): void => log('info', message),
    warn: (message: unknown): void => log('warn', message),
    error: (message: unknown): void => log('error', message),
};
