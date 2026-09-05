import { resolve } from 'node:path';
import compression from 'compression';
import express, { type Application } from 'express';
import expressLayouts from 'express-ejs-layouts';
import helmet from 'helmet';
import methodOverride from 'method-override';
import morgan from 'morgan';
import healthCheckRoute from './routes/health-check.route.ts';
import mainRoute from './routes/main.route.ts';
import notFoundRoute from './routes/not-found.route.ts';
import todoRoute from './routes/todo.route.ts';

const init = (): Application => {
    const app: Application = express();

    app.set('views', resolve(import.meta.dirname, '../src/views'));
    app.set('view engine', 'ejs');
    app.set('view cache', process.env.NODE_ENV === 'production');

    app.use(helmet());
    app.use(compression());
    app.use(morgan('dev'));
    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));
    app.use(express.static(resolve(import.meta.dirname, '../public'), { maxAge: '7d' }));
    app.use(expressLayouts);
    app.use(methodOverride('_method'));

    app.use('/', todoRoute);
    app.use('/api', mainRoute);
    app.use('/api/health-check', healthCheckRoute);
    app.use(notFoundRoute);

    return app;
};

export default init;
