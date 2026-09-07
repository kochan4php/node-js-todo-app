import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import { toNodeHandler } from 'better-auth/node';
import compression from 'compression';
import express, { type Application, type NextFunction, type Request, type Response } from 'express';
import expressLayouts from 'express-ejs-layouts';
import helmet from 'helmet';
import methodOverride from 'method-override';
import morgan from 'morgan';
import { auth } from './app/auth/auth.ts';
import { render } from './app/helpers/render.ts';
import { requireAuth } from './app/middleware/require-auth.ts';
import { logger } from './logger/index.ts';
import authRoute from './routes/auth.route.ts';
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
    app.set('trust proxy', 1); /* 602 — behind a single reverse proxy */

    /* Order (592): helmet → compression → static → body parsers → routes. */
    /* Per-request nonce so the inline theme script can run without 'unsafe-inline'. */
    app.use((_req, res, next: NextFunction) => {
        res.locals.cspNonce = randomBytes(16).toString('base64');
        next();
    });
    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    /* Upgrade-insecure-requests (a helmet default) removed:
                       the app is fully self-hosted and served over local/LAN
                       HTTP — the directive makes the browser upgrade our fetch
                       redirects to https and every async action
                       (toggle/delete) fails. */
                    'upgrade-insecure-requests': null,
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
    /* 851 — Permissions-Policy: deny geolocation/camera/microphone on every page. */
    app.use((_req, res, next: NextFunction) => {
        res.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
        next();
    });

    app.use(compression());
    app.use(express.static(resolve(import.meta.dirname, '../public'), { maxAge: '7d', etag: true }));

    /* Better Auth handler — mounted BEFORE express.json(): body parsers would
       consume the request stream and break auth endpoint handling. */
    app.all('/api/auth/*splat', toNodeHandler(auth));

    /* 846 — body limited to 10kb; /api/import is exempt because it uploads JSON
       backups (its own parser enforces a 1mb limit at the route). */
    const jsonParser = express.json({ limit: '10kb' });
    app.use((req, res, next: NextFunction) => {
        if (req.path === '/api/import') return next();
        jsonParser(req, res, next);
    });
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));
    app.use(expressLayouts);
    app.use(methodOverride('_method'));
    /* 594 — in production the 'short' format suffices (terse status); dev gets
       the verbose one. 725/732 — health endpoint must not flood the logs. */
    app.use(
        morgan(process.env.NODE_ENV === 'production' ? 'short' : 'dev', {
            skip: (req) => req.path.startsWith('/api/health'),
        }),
    );

    /* 500 — mutations must not be cached by intermediaries; HTML GET revalidates (537). */
    app.use((req, res, next: NextFunction) => {
        if (!['GET', 'HEAD'].includes(req.method)) res.set('Cache-Control', 'no-store');
        next();
    });

    app.use('/', seoRoute);
    app.use('/api/health-check', healthCheckRoute);
    app.use('/', authRoute);
    app.use(requireAuth); /* every page/API below requires a session */
    app.use('/', todoRoute);
    app.use('/api', mainRoute);
    app.use(notFoundRoute);

    /* 527/726 — unexpected errors: full stack in dev, short message in prod, 500 page. */
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
        logger.error(process.env.NODE_ENV === 'production' ? err.message : (err.stack ?? err.message));
        res.status(500);
        if (res.headersSent) return;
        render(res, '500', { title: 'Terjadi kesalahan', layout: 'layouts/main', robots: 'noindex, follow' });
    });

    return app;
};

export default init;
