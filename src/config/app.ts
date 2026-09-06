import { resolve } from 'node:path';

export const PORT = Number(process.env.PORT) || 3000;
export const DATA_FILE = process.env.DATA_PATH || resolve(import.meta.dirname, '../../data/todos.json');
export const MAX_TODOS = Number(process.env.TODOS_LIMIT) || 1000; /* 814 — limit configurable */

/* 521/550 — canonical & sitemap memakai domain absolut; set SITE_URL=https://… di produksi. */
export const SITE_URL = (process.env.SITE_URL || `http://localhost:${PORT}`).replace(/\/+$/, '');
export const APP_NAME = 'Rencana';
