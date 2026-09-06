import express, { type Router } from 'express';
import { SITE_URL } from '../config/app.ts';

const router: Router = express.Router();

/* 473/495 — dynamic sitemap via route; the static pages that can be indexed. */
router.get('/sitemap.xml', (_req, res) => {
    const urls = ['/', '/add-todo'].map((path) => `<url><loc>${SITE_URL}${path}</loc><changefreq>daily</changefreq></url>`);
    res.type('application/xml')
        .set('Cache-Control', 'no-cache')
        .send(
            `<?xml version="1.0" encoding="UTF-8"?>\n` +
                `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
                urls.join('\n') +
                '\n</urlset>\n',
        );
});

/* 474/539 — robots.txt: block API routes from crawlers. */
router.get('/robots.txt', (_req, res) => {
    res.type('text/plain')
        .set('Cache-Control', 'no-cache')
        .send(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});

export default router;
