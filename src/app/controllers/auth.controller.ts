import { fromNodeHeaders } from 'better-auth/node';
import type { Request, Response } from 'express';
import { auth } from '../auth/auth.ts';
import { authEventsOf, logAuthEvent, requestContext } from '../auth/auth-audit.service.ts';
import { deviceLogsOf, removeDeviceLog } from '../auth/device.service.ts';
import { fmtDateTime, relativeWhen, todayLong } from '../helpers/date.ts';
import { render } from '../helpers/render.ts';

type AuthEndpointResponse = globalThis.Response;

/* Never let a login redirect point off-site (open-redirect guard). */
function safeNext(raw: unknown): string {
    const next = typeof raw === 'string' ? raw : '';
    return next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

/* Copy Better Auth's set-cookie headers (session + CSRF) onto the Express
   response after a server-side sign-in/sign-up/sign-out. */
function forwardSetCookies(res: Response, authRes: AuthEndpointResponse): void {
    const cookies = authRes.headers.getSetCookie();
    if (cookies.length > 0) res.setHeader('set-cookie', cookies);
}

async function loginErrorText(authRes: AuthEndpointResponse): Promise<string> {
    if (authRes.status === 429) return 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.';
    try {
        const body = (await authRes.json()) as { message?: string };
        const msg = String(body?.message ?? '').toLowerCase();
        if (msg.includes('verify')) return 'Email kamu belum diverifikasi.';
        return 'Email atau kata sandi salah.';
    } catch {
        return 'Email atau kata sandi salah.';
    }
}

async function registerErrorText(authRes: AuthEndpointResponse): Promise<string> {
    if (authRes.status === 429) return 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.';
    try {
        const body = (await authRes.json()) as { message?: string };
        const msg = String(body?.message ?? '').toLowerCase();
        if (msg.includes('already exists') || msg.includes('already registered')) return 'Email sudah terdaftar. Silakan masuk.';
        if (msg.includes('at least 8')) return 'Kata sandi minimal 8 karakter.';
        if (msg.includes('max') && msg.includes('characters')) return 'Kata sandi maksimal 128 karakter.';
        if (msg.includes('invalid email') || msg.includes('valid email')) return 'Format email tidak valid.';
        if (msg.includes('name')) return 'Nama tidak valid.';
        return 'Pendaftaran gagal. Coba lagi.';
    } catch {
        return 'Pendaftaran gagal. Coba lagi.';
    }
}

function authFields(body: Record<string, unknown>): { email: string; password: string; name: string } {
    return {
        email: String(body.email ?? '')
            .trim()
            .toLowerCase(),
        password: String(body.password ?? ''),
        name: String(body.name ?? '').trim(),
    };
}

function loginForm(req: Request, res: Response): void {
    const session = res.locals.session as { user?: unknown } | undefined;
    if (session?.user) return void res.redirect('/');

    render(res, 'login', {
        title: 'Masuk',
        description: 'Masuk ke buku rencanamu — rencana tersimpan aman di akunmu.',
        layout: 'layouts/main',
        robots: 'noindex, follow',
        today: todayLong(),
        flash: String(req.query.flash ?? ''),
        old: '',
        next: safeNext(req.query.next),
        error: '',
    });
}

async function login(req: Request, res: Response): Promise<void> {
    const session = res.locals.session as { user?: unknown } | undefined;
    if (session?.user) return void res.redirect('/');

    const email = String((req.body as Record<string, unknown>).email ?? '')
        .trim()
        .toLowerCase();
    const password = String((req.body as Record<string, unknown>).password ?? '');
    if (!email || !password) {
        return render(res, 'login', {
            title: 'Masuk',
            description: 'Masuk ke buku rencanamu — rencana tersimpan aman di akunmu.',
            layout: 'layouts/main',
            robots: 'noindex, follow',
            today: todayLong(),
            flash: '',
            old: email,
            next: safeNext(req.query.next),
            error: 'Email dan kata sandi wajib diisi.',
        });
    }

    const authRes = await auth.api.signInEmail({ body: { email, password }, headers: fromNodeHeaders(req.headers), asResponse: true });
    if (!authRes.ok) {
        const reason = await loginErrorText(authRes);
        const ctx = requestContext(req);
        await logAuthEvent({
            type: 'sign-in',
            success: false,
            userId: null,
            reason,
            ...ctx,
            userAgent: req.headers['user-agent']?.toString(),
        });
        return render(res, 'login', {
            title: 'Masuk',
            description: 'Masuk ke buku rencanamu — rencana tersimpan aman di akunmu.',
            layout: 'layouts/main',
            robots: 'noindex, follow',
            today: todayLong(),
            flash: '',
            old: email,
            next: safeNext(req.query.next),
            error: reason,
        });
    }

    const body = (await authRes.clone().json()) as { user?: { id?: string }; token?: string } | null;
    if (body?.user?.id) {
        const ctx = requestContext(req);
        await logAuthEvent({
            type: 'sign-in',
            success: true,
            userId: body.user.id,
            sessionToken: body.token,
            ...ctx,
            userAgent: req.headers['user-agent']?.toString(),
        });
    }

    forwardSetCookies(res, authRes);
    return void res.redirect(safeNext(req.query.next));
}

function registerForm(_req: Request, res: Response): void {
    const session = res.locals.session as { user?: unknown } | undefined;
    if (session?.user) return void res.redirect('/');

    render(res, 'register', {
        title: 'Daftar',
        description: 'Buat akun Rencana — catat dan kelola rencana harianmu dengan aman.',
        layout: 'layouts/main',
        robots: 'noindex, follow',
        today: todayLong(),
        flash: '',
        old: '',
        oldEmail: '',
        error: '',
    });
}

async function register(req: Request, res: Response): Promise<void> {
    const session = res.locals.session as { user?: unknown } | undefined;
    if (session?.user) return void res.redirect('/');

    const { name, email, password } = authFields(req.body as Record<string, unknown>);
    const error = !name
        ? 'Nama wajib diisi.'
        : !email
          ? 'Email wajib diisi.'
          : !password
            ? 'Kata sandi wajib diisi.'
            : password.length < 8
              ? 'Kata sandi minimal 8 karakter.'
              : '';
    if (error) {
        return render(res, 'register', {
            title: 'Daftar',
            description: 'Buat akun Rencana — catat dan kelola rencana harianmu dengan aman.',
            layout: 'layouts/main',
            robots: 'noindex, follow',
            today: todayLong(),
            flash: '',
            old: name,
            oldEmail: email,
            error,
        });
    }

    const authRes = await auth.api.signUpEmail({
        body: { name, email, password },
        headers: fromNodeHeaders(req.headers),
        asResponse: true,
    });
    if (!authRes.ok) {
        const reason = await registerErrorText(authRes);
        const ctx = requestContext(req);
        await logAuthEvent({
            type: 'sign-up',
            success: false,
            userId: null,
            reason,
            ...ctx,
            userAgent: req.headers['user-agent']?.toString(),
        });
        return render(res, 'register', {
            title: 'Daftar',
            description: 'Buat akun Rencana — catat dan kelola rencana harianmu dengan aman.',
            layout: 'layouts/main',
            robots: 'noindex, follow',
            today: todayLong(),
            flash: '',
            old: name,
            oldEmail: email,
            error: reason,
        });
    }

    const body = (await authRes.clone().json()) as { user?: { id?: string }; token?: string } | null;
    if (body?.user?.id) {
        const ctx = requestContext(req);
        await logAuthEvent({
            type: 'sign-up',
            success: true,
            userId: body.user.id,
            sessionToken: body.token,
            ...ctx,
            userAgent: req.headers['user-agent']?.toString(),
        });
    }

    forwardSetCookies(res, authRes);
    return void res.redirect('/?flash=registered');
}

function logoutForm(_req: Request, res: Response): void {
    const session = res.locals.session as { user?: unknown } | undefined;
    if (session?.user) return void res.redirect('/');
    return void res.redirect('/login');
}

async function logout(req: Request, res: Response): Promise<void> {
    const session = res.locals.session as { user?: { id?: string }; session?: { token?: string } } | undefined;
    const authRes = await auth.api.signOut({ headers: fromNodeHeaders(req.headers), asResponse: true });
    if (session?.user?.id) {
        const ctx = requestContext(req);
        await logAuthEvent({
            type: 'sign-out',
            success: true,
            userId: session.user.id,
            sessionToken: session.session?.token,
            ...ctx,
            userAgent: req.headers['user-agent']?.toString(),
        });
    }
    forwardSetCookies(res, authRes);
    return void res.redirect('/login?flash=left');
}

type SessionDto = { token: string; expiresAt: Date | string };

function sessionsOf(list: unknown): SessionDto[] {
    if (Array.isArray(list)) return list as SessionDto[];
    const wrapped = list as { sessions?: SessionDto[] } | null;
    return wrapped?.sessions ?? [];
}

type AccountUser = { id: string; name: string; email: string; emailVerified: boolean; role?: string; createdAt: string | Date };

function accountSession(res: Response): { user: AccountUser; session: { token: string } } | null {
    const session = res.locals.session as { user: AccountUser; session: { token: string } } | undefined;
    return session ?? null;
}

async function renderAccount(
    req: Request,
    res: Response,
    session: { user: AccountUser; session: { token: string } },
    overrides: Record<string, unknown> = {},
): Promise<void> {
    const headers = fromNodeHeaders(req.headers);
    const activeSessions = sessionsOf(await auth.api.listSessions({ headers }));
    const devices = await deviceLogsOf(session.user.id);
    const activity = await authEventsOf(session.user.id);

    const rows = devices.map((device) => {
        const live = activeSessions.find((s) => s.token === device.sessionToken);
        return {
            ...device,
            active: Boolean(live),
            current: device.sessionToken === session.session.token,
            expiresAt: live ? new Date(live.expiresAt) : null,
        };
    });

    render(res, 'account', {
        title: 'Akun & Keamanan',
        description: 'Detail akun, kata sandi, perangkat login, dan aktivitas login Rencana.',
        layout: 'layouts/main',
        robots: 'noindex, follow',
        today: todayLong(),
        flash: String(req.query.flash ?? ''),
        user: session.user,
        devices: rows,
        activity,
        fmtTime: fmtDateTime,
        relativeWhen,
        pwError: '',
        ...overrides,
    });
}

async function account(req: Request, res: Response): Promise<void> {
    const session = accountSession(res);
    if (!session) return void res.redirect('/login');
    return renderAccount(req, res, session);
}

async function changePassword(req: Request, res: Response): Promise<void> {
    const session = accountSession(res);
    if (!session) {
        return void res.redirect('/login');
    }

    const body = req.body as Record<string, unknown>;
    const currentPassword = String(body.currentPassword ?? '');
    const newPassword = String(body.newPassword ?? '');
    const confirm = String(body.confirmPassword ?? '');

    const error = !currentPassword
        ? 'Kata sandi saat ini wajib diisi.'
        : !newPassword
          ? 'Kata sandi baru wajib diisi.'
          : newPassword.length < 8
            ? 'Kata sandi baru minimal 8 karakter.'
            : newPassword.length > 128
              ? 'Kata sandi baru maksimal 128 karakter.'
              : newPassword !== confirm
                ? 'Konfirmasi kata sandi baru tidak cocok.'
                : '';
    if (error) {
        return renderAccount(req, res, session, { pwError: error });
    }

    try {
        await auth.api.changePassword({
            body: { currentPassword, newPassword },
            headers: fromNodeHeaders(req.headers),
        });
        const ctx = requestContext(req);
        await logAuthEvent({
            type: 'password-change',
            success: true,
            userId: session.user.id,
            sessionToken: session.session.token,
            ...ctx,
            userAgent: req.headers['user-agent']?.toString(),
        });

        /* Password change keeps the current session, but every other session
           must die so a leaked session can't outlive the credential change. */
        const headers = fromNodeHeaders(req.headers);
        for (const other of sessionsOf(await auth.api.listSessions({ headers }))) {
            if (other.token === session.session.token) continue;
            await auth.api.revokeSession({ body: { token: other.token }, headers });
            await removeDeviceLog(other.token);
            await logAuthEvent({
                type: 'revoke',
                success: true,
                userId: session.user.id,
                sessionToken: other.token,
                ...ctx,
                userAgent: req.headers['user-agent']?.toString(),
            });
        }
        return void res.redirect('/account?flash=password-changed');
    } catch (changeError) {
        const message = changeError instanceof Error ? changeError.message.toLowerCase() : '';
        const reason = message.includes('password')
            ? 'Kata sandi saat ini salah. Periksa kembali.'
            : 'Gagal mengubah kata sandi. Coba lagi.';
        const ctx = requestContext(req);
        await logAuthEvent({
            type: 'password-change',
            success: false,
            userId: session.user.id,
            reason,
            ...ctx,
            userAgent: req.headers['user-agent']?.toString(),
        });
        return renderAccount(req, res, session, { pwError: reason });
    }
}

async function revoke(req: Request, res: Response): Promise<void> {
    const token = String((req.body as Record<string, unknown>).token ?? '');
    if (!token) return void res.redirect('/account');
    const session = res.locals.session as { user?: { id?: string }; session?: { token?: string } } | undefined;
    await auth.api.revokeSession({ body: { token }, headers: fromNodeHeaders(req.headers) });
    await removeDeviceLog(token);
    if (session?.user?.id) {
        const ctx = requestContext(req);
        await logAuthEvent({
            type: 'revoke',
            success: true,
            userId: session.user.id,
            sessionToken: token,
            ...ctx,
            userAgent: req.headers['user-agent']?.toString(),
        });
    }
    return void res.redirect('/account?flash=revoked');
}

async function revokeAll(req: Request, res: Response): Promise<void> {
    const session = res.locals.session as { user?: { id?: string }; session?: { token?: string } } | undefined;
    const headers = fromNodeHeaders(req.headers);
    const tokens = sessionsOf(await auth.api.listSessions({ headers })).map((s) => s.token);
    for (const token of tokens) {
        await auth.api.revokeSession({ body: { token }, headers });
        await removeDeviceLog(token);
    }
    if (session?.user?.id) {
        const ctx = requestContext(req);
        await logAuthEvent({
            type: 'revoke-all',
            success: true,
            userId: session.user.id,
            ...ctx,
            userAgent: req.headers['user-agent']?.toString(),
        });
    }
    return void res.redirect('/login?flash=left');
}

export default { loginForm, login, registerForm, register, logout, logoutForm, account, changePassword, revoke, revokeAll };
