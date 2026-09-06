import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import compression from 'compression';
import express, { type Application, type NextFunction, type Request, type Response } from 'express';
import expressLayouts from 'express-ejs-layouts';
import helmet from 'helmet';
import methodOverride from 'method-override';
import morgan from 'morgan';
import { render } from './app/helpers/render.ts';
import { logger } from './logger/index.ts';
import healthCheckRoute from './routes/health-check.route.ts';
import mainRoute from './routes/main.route.ts';
import notFoundRoute from './routes/not-found.route.ts';
import seoRoute from './routes/seo.route.ts';
import todoRoute from './routes/todo.route.ts';

const init = (): Application => {
    const app: Application = express();

    app.set('views', resolve(import.meta.dirname, '../src/views'));
    app.set('view engine', 'ejs');
    app.set('view cache', process.env.NODE_ENV === 'production');
    app.set('trust proxy', 1); /* 602 — di belakang satu reverse proxy */

    /* Urutan (592): helmet → compression → static → parser body → rute. */
    /* Nonce per-request agar script inline tema bisa jalan tanpa 'unsafe-inline'. */
    app.use((_req, res, next: NextFunction) => {
        res.locals.cspNonce = randomBytes(16).toString('base64');
        next();
    });
    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    'script-src': [
                        "'self'",
                        (_req, res) => {
                            const outgoing = res as unknown as { locals: { cspNonce?: string } };
                            return `'nonce-${outgoing.locals.cspNonce}'`;
                        },
                    ],
                },
            },
        }),
    );
    /* 851 — Permissions-Policy: tolak geolokasi/kamera/mikro di semua halaman. */
    app.use((_req, res, next: NextFunction) => {
        res.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
        next();
    });

    app.use(compression());
    app.use(express.static(resolve(import.meta.dirname, '../public'), { maxAge: '7d', etag: true }));
    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));
    app.use(expressLayouts);
    app.use(methodOverride('_method'));
    /* 594 — di produksi log cukup short (status ringkas), dev cukup dev.
       725/732 — endpoint health tidak banjiri log. */
    app.use(
        morgan(process.env.NODE_ENV === 'production' ? 'short' : 'dev', {
            skip: (req) => req.path.startsWith('/api/health'),
        }),
    );

    /* 500 — mutasi tidak boleh di-cache oleh intermediate; GET HTML revalidasi (537). */
    app.use((req, res, next: NextFunction) => {
        if (!['GET', 'HEAD'].includes(req.method)) res.set('Cache-Control', 'no-store');
        next();
    });

    app.use('/', seoRoute);
    app.use('/', todoRoute);
    app.use('/api', mainRoute);
    app.use('/api/health-check', healthCheckRoute);
    app.use(notFoundRoute);

    /* 527/726 — error tak terduga: stack di dev, pesan singkat di prod, halaman 500. */
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
        logger.error(process.env.NODE_ENV === 'production' ? err.message : (err.stack ?? err.message));
        res.status(500);
        if (res.headersSent) return;
        render(res, '500', { title: 'Terjadi kesalahan', layout: 'layouts/main', robots: 'noindex, follow' });
    });

    return app;
};

export default init;
