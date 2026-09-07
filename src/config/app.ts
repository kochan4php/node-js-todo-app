export const PORT = Number(process.env.PORT) || 3333;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/planner'; /* 814 — override via env at deploy time */
export const MAX_TODOS = Number(process.env.TODOS_LIMIT) || 1000; /* 814 — configurable limit */
export const NODE_ENV = process.env.NODE_ENV ?? 'development';

/* Auth — Better Auth requires a secret; refuse to boot with a known default
   in production. Set BETTER_AUTH_SECRET via env at deploy time (1140/1142). */
export const AUTH_SECRET = (() => {
    const secret = process.env.BETTER_AUTH_SECRET?.trim();
    if (secret) return secret;
    if (NODE_ENV === 'production') throw new Error('BETTER_AUTH_SECRET must be set when NODE_ENV=production.');
    return 'dev-only-secret-change-me';
})();

/* Public origin used for auth cookies/redirects; mirrors SITE_URL unless set. */
export const AUTH_URL = (process.env.BETTER_AUTH_URL || process.env.SITE_URL || `http://localhost:${PORT}`).replace(/\/+$/, '');

/* 521/550 — canonical & sitemap use an absolute domain; set SITE_URL=https://… in production. */
export const SITE_URL = (process.env.SITE_URL || `http://localhost:${PORT}`).replace(/\/+$/, '');
export const APP_NAME = 'Rencana';
