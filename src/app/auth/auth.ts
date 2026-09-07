import { mongodbAdapter } from '@better-auth/mongo-adapter';
import { betterAuth } from 'better-auth';
import mongoose from 'mongoose';
import { AUTH_SECRET, AUTH_URL, NODE_ENV } from '../../config/app.ts';
import { logger } from '../../logger/index.ts';
import { recordLogin } from './device.service.ts';

const db = mongoose.connection.db;
if (!db) throw new Error('MongoDB must be connected before initializing auth.');

/* Better Auth owns its own tables (user, session, account, verification) in
   the same "planner" database via the shared Mongoose connection client —
   no separate connection, no schema migration needed for MongoDB. */
export const auth = betterAuth({
    baseURL: AUTH_URL,
    secret: AUTH_SECRET,
    /* ponytail: transaction:false — the adapter's withTransaction wrapper
       misbehaves on single-node set-ups (abort-after-commit); single-user
       sign-up isn't worth transactional guarantees. Re-enable on a real
       replica set if multi-write consistency matters. */
    database: mongodbAdapter(db, { client: mongoose.connection.getClient(), transaction: false }),
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        autoSignIn: true,
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7 /* 7 days until the session expires */,
        updateAge: 60 * 60 * 24 /* sliding expiry: refreshed after a day of activity */,
    },
    user: {
        additionalFields: {
            role: { type: 'string', defaultValue: 'user', input: false, returned: true },
        },
    },
    databaseHooks: {
        session: {
            create: {
                after: async (session, context) => {
                    /* Every fresh login lands a row in `devices` (ip, browser,
                       OS, device model). ipAddress/userAgent are captured by
                       Better Auth from the request headers. */
                    try {
                        const request = context?.request as { headers?: Headers } | undefined;
                        await recordLogin({
                            userId: session.userId,
                            sessionToken: session.token,
                            ip: session.ipAddress ?? request?.headers?.get('x-forwarded-for') ?? request?.headers?.get('x-real-ip'),
                            userAgent: session.userAgent ?? request?.headers?.get('user-agent'),
                            language: request?.headers?.get('accept-language'),
                        });
                    } catch (error) {
                        logger.error(`session.create hook failed: ${error instanceof Error ? error.message : String(error)}`);
                    }
                },
            },
        },
    },
    advanced: {
        useSecureCookies: NODE_ENV === 'production',
        ipAddress: {
            ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
            disableIpTracking: false,
        },
        cookiePrefix: 'rencana',
    },
    rateLimit: {
        enabled: true,
        window: 60,
        max: 120,
        customRules: {
            '/sign-in/email': { window: 60, max: 10 },
            '/sign-up/email': { window: 60, max: 5 },
        },
    },
});
