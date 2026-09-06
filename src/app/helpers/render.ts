import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Response } from 'express';
import { APP_NAME, SITE_URL } from '../../config/app.ts';

/* 608 — versi aset untuk ?v= bust cache; ambil dari package.json. */
const ASSET_VERSION = JSON.parse(readFileSync(resolve(import.meta.dirname, '../../../package.json'), 'utf8')).version as string;

/* 463 — judul fallback; 479 — pattern "Nama App · Deskripsi" lahir di layout helper. */
const DEFAULT_TITLE = APP_NAME;
const DEFAULT_DESCRIPTION = 'Catat, selesaikan, dan rayakan langkah kecilmu — semua tersimpan di perangkatmu, tanpa akun, tanpa database.';
const DEFAULT_ROBOTS = 'index, follow';

export interface ViewData {
    layout: string;
    title?: string;
    description?: string;
    robots?: string;
    [key: string]: unknown;
}

export function render(res: Response, view: string, data?: ViewData): void {
    const req = res.req;
    const path = req.path === '/' ? '/' : req.path.replace(/\/+$/, '');

    const d = (data ?? {}) as Record<string, unknown>;
    const rawTitle = typeof d.title === 'string' && d.title.trim() ? d.title.trim() : DEFAULT_TITLE;
    const title = rawTitle === APP_NAME ? APP_NAME : `${APP_NAME} · ${rawTitle}`;
    const description = typeof d.description === 'string' ? d.description : DEFAULT_DESCRIPTION;
    const robots = typeof d.robots === 'string' ? d.robots : DEFAULT_ROBOTS;

    /* 465/492/507/544 — canonical & og:url absolut, tanpa query. */
    const canonical = `${SITE_URL}${path}`;

    res.set('Cache-Control', 'no-cache'); /* 537 — HTML direvalidasi, bukan disimpan buta */
    res.render(view, {
        ...d,
        title,
        description,
        robots,
        canonical,
        ogUrl: canonical,
        ogImage: `${SITE_URL}/og-image.png`,
        appName: APP_NAME,
        siteUrl: SITE_URL,
        assetVersion: ASSET_VERSION,
    });
}
