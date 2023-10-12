/**
 * @description This file contain a method to init express application
 * @description It will connect to database MongoDB and use all middlewares
 * @description It also contain all routes for all endpoints
 * @author {Deo Sbrn}
 */

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import expressLayouts from 'express-ejs-layouts';
import { rateLimit } from 'express-rate-limit';
import methodOverride from 'method-override';
import morgan from 'morgan';
import auth from './app/middlewares/auth.middleware';
import isAdmin from './app/middlewares/is-admin.middleware';
import { corsConfig, limitterConfig } from './config/app';
import database from './config/database';
import userRoute from './routes/admin/user.route';
import authRoute from './routes/auth.route';
import healthCheckRoute from './routes/health-check.route';
import mainRoute from './routes/main.route';
import notFoundRoute from './routes/not-found.route';
import todoRoute from './routes/todo.route';

/**
 * @description Init express application
 * @returns {Application} - Express application
 */
const init = function (): Application {
    // * Init express app
    const app: Application = express();

    // * Connect to database
    database();

    // * Set Views
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');

    // * Middlewares
    app.use(cors(corsConfig()));
    app.use(rateLimit(limitterConfig()));
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.static('public'));
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan('dev'));
    app.use(expressLayouts);
    app.use(methodOverride('_method'));

    // * Todo Route with view engine
    app.use('/', todoRoute);

    // * Main Route
    app.use('/api', mainRoute);

    // * Health Check Route
    app.use('/api/health-check', healthCheckRoute);

    // * Auth Route
    app.use('/api/auth', authRoute);

    // * Admin Route
    app.use('/api/admin/users', auth, isAdmin, userRoute);

    // * 404 Not Found
    app.use(notFoundRoute);

    // * Return express app
    return app;
};

export default init;
