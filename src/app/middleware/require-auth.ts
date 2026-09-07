import { fromNodeHeaders } from 'better-auth/node';
import type { NextFunction, Request, Response } from 'express';
import { auth } from '../auth/auth.ts';

export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;

/* Gate for the todo UI + backup API: no valid Better Auth session → bounce to
   /login keeping the intended destination. The resolved session is exposed to
   views via res.locals.session. */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
        if (!session) {
            const nextPath = encodeURIComponent(req.originalUrl);
            return void res.redirect(`/login?next=${nextPath}`);
        }
        res.locals.session = session;
        return next();
    } catch (error: unknown) {
        return next(error);
    }
}
