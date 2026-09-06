export const PORT = Number(process.env.PORT) || 3333;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rencana'; /* 814 — ubah lewat env di deploy */
export const MAX_TODOS = Number(process.env.TODOS_LIMIT) || 1000; /* 814 — limit configurable */

/* 521/550 — canonical & sitemap memakai domain absolut; set SITE_URL=https://… di produksi. */
export const SITE_URL = (process.env.SITE_URL || `http://localhost:${PORT}`).replace(/\/+$/, '');
export const APP_NAME = 'Rencana';
