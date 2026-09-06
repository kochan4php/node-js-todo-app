export const PORT = Number(process.env.PORT) || 3333;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/plans'; /* 814 — override via env at deploy time */
export const MAX_TODOS = Number(process.env.TODOS_LIMIT) || 1000; /* 814 — configurable limit */

/* 521/550 — canonical & sitemap use an absolute domain; set SITE_URL=https://… in production. */
export const SITE_URL = (process.env.SITE_URL || `http://localhost:${PORT}`).replace(/\/+$/, '');
export const APP_NAME = 'Rencana';
