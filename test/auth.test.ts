import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, test } from 'node:test';
import { deviceHashOf, deviceLogsOf } from '../src/app/auth/device.service.ts';
import { AuthEventModel } from '../src/app/models/auth-event.model.ts';
import { DeviceLogModel } from '../src/app/models/device-log.model.ts';
import { UserModel } from '../src/app/models/user.model.ts';
import { connectTestDb, type StopFn } from './helpers/mongo.ts';

let server: Server;
let base: string;
let stopDb: StopFn;

const EMAIL = 'auth-test@example.test';
const PASSWORD = 'supersecret123';
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

function form(values: Record<string, string>): string {
    return new URLSearchParams(values).toString();
}

function cookieOf(res: Response): string {
    return res.headers
        .getSetCookie()
        .map((part) => part.split(';')[0])
        .join('; ');
}

function reqHeaders(cookie: string, extra?: unknown): Headers {
    const headers = new Headers();
    if (cookie) headers.set('cookie', cookie);
    if (extra instanceof Headers) {
        extra.forEach((value, key) => {
            headers.set(key, value);
        });
    } else if (Array.isArray(extra)) {
        for (const [key, value] of extra) headers.set(key, value);
    } else if (extra && typeof extra === 'object') {
        for (const [key, value] of Object.entries(extra)) headers.set(key, String(value));
    }
    return headers;
}

async function req(path: string, cookie: string, init?: RequestInit): Promise<Response> {
    return fetch(`${base}${path}`, { ...init, redirect: 'manual', headers: reqHeaders(cookie, init?.headers) });
}

async function postForm(path: string, cookie: string, values: Record<string, string>): Promise<Response> {
    return req(path, cookie, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded', 'x-forwarded-for': '203.0.113.42', 'user-agent': BROWSER_UA },
        body: form(values),
        redirect: 'manual',
    });
}

before(async () => {
    stopDb = await connectTestDb();
    const { default: init } = await import('../src/app.ts');
    const app = init();
    server = app.listen(0);
    await new Promise<void>((resolveListen) => server.once('listening', resolveListen));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(
    () =>
        new Promise<void>((resolveDone) => {
            server.close(() => void stopDb().then(resolveDone));
        }),
);

test('Authentication flow (register → login → protected pages → devices → logout)', async (t) => {
    await t.test('GET /login renders the Indonesian form', async () => {
        const res = await req('/login', '');
        assert.equal(res.status, 200);
        const html = await res.text();
        assert.ok(html.includes('Selamat datang'));
        assert.ok(html.includes('Kembali ke rencana') === false, 'login page is not the dashboard');
        assert.ok(html.includes('Masuk akun'));
    });

    await t.test('GET /register renders the registration form (no 500)', async () => {
        const res = await req('/register', '');
        assert.equal(res.status, 200);
        const html = await res.text();
        assert.ok(html.includes('Buat akun Rencana'), 'registration card renders');
        assert.ok(html.includes('id="reg-email"'), 'email field renders');
    });

    await t.test('GET / without a session redirects to /login with next', async () => {
        const res = await req('/', '');
        assert.equal(res.status, 302);
        assert.equal(res.headers.get('location'), '/login?next=%2F');
    });

    await t.test('GET /add-todo without a session also bounces to login', async () => {
        const res = await req('/add-todo', '');
        assert.equal(res.status, 302);
        assert.equal(res.headers.get('location'), '/login?next=%2Fadd-todo');
    });

    let sessionCookie = '';
    await t.test('POST /register creates an account and signs in', async () => {
        const res = await postForm('/register', '', { name: 'Auth User', email: EMAIL, password: PASSWORD });
        assert.equal(res.status, 302);
        assert.equal(res.headers.get('location'), '/?flash=registered');
        assert.ok(res.headers.getSetCookie().length >= 1, 'sign-up sets session cookies');

        sessionCookie = cookieOf(res);
        const home = await req('/', sessionCookie);
        assert.equal(home.status, 200);
        const html = await home.text();
        assert.ok(html.includes('class="nav-avatar"'), 'signed-in nav shows the user avatar');
        assert.ok(html.includes('href="/account"'), 'account link appears');
    });

    await t.test('POST /register with a duplicate email shows an Indonesian error', async () => {
        const res = await postForm('/register', '', { name: 'Duplicate', email: EMAIL, password: PASSWORD });
        assert.equal(res.status, 200);
        const html = await res.text();
        assert.ok(html.includes('sudah terdaftar'), 'duplicate email error is Indonesian');
    });

    await t.test('POST /register with a short password is rejected', async () => {
        const res = await postForm('/register', '', { name: 'Short', email: 'short@example.test', password: 'tiny' });
        assert.equal(res.status, 200);
        const html = await res.text();
        assert.ok(html.includes('minimal 8 karakter'), 'short password error is Indonesian');
    });

    await t.test('POST /login with a wrong password shows an Indonesian error', async () => {
        const res = await postForm('/login', '', { email: EMAIL, password: 'wrong-password' });
        assert.equal(res.status, 200);
        const html = await res.text();
        assert.ok(html.includes('Email atau kata sandi salah.'));
    });

    let secondCookie = '';
    let thirdCookie = '';
    await t.test('POST /login succeeds and honors ?next=', async () => {
        const res = await postForm('/login?next=%2Fadd-todo', '', { email: EMAIL, password: PASSWORD });
        assert.equal(res.status, 302);
        assert.equal(res.headers.get('location'), '/add-todo');
        secondCookie = cookieOf(res);

        const addPage = await req('/add-todo', secondCookie);
        assert.equal(addPage.status, 200);
    });

    await t.test('GET /account shows account details, devices and activity', async () => {
        const res = await req('/account', sessionCookie);
        assert.equal(res.status, 200);
        const html = await res.text();
        assert.ok(html.includes('Akun'));
        assert.ok(html.includes('Auth User'), 'account name shown');
        assert.ok(html.includes(EMAIL), 'account email shown');
        assert.ok(html.includes('Detail akun'), 'account details card rendered');
        assert.ok(html.includes('Ganti kata sandi'), 'change-password form rendered');
        assert.ok(html.includes('Aktivitas login'), 'activity section rendered');
        assert.ok(html.includes('203.0.113.42'), 'login IP is displayed');
        assert.ok(html.includes('perangkat ini'), 'current session is marked');
        assert.ok(html.includes('email/password'), 'auth method rendered');
    });

    await t.test('POST /account/password with a wrong current password is rejected', async () => {
        const res = await postForm('/account/password', sessionCookie, {
            currentPassword: 'not-current-pass',
            newPassword: 'brand-new-pass-1',
            confirmPassword: 'brand-new-pass-1',
        });
        assert.equal(res.status, 200);
        const html = await res.text();
        assert.ok(html.includes('Kata sandi saat ini salah'), 'wrong current password error is Indonesian');
    });

    await t.test('POST /account/password changes the password and keeps the session', async () => {
        const res = await postForm('/account/password', sessionCookie, {
            currentPassword: PASSWORD,
            newPassword: 'brand-new-pass-1',
            confirmPassword: 'brand-new-pass-1',
        });
        assert.equal(res.status, 302);
        assert.equal(res.headers.get('location'), '/account?flash=password-changed');

        const home = await req('/', sessionCookie);
        assert.equal(home.status, 200, 'session survives the password change');

        const oldLogin = await postForm('/login', '', { email: EMAIL, password: PASSWORD });
        assert.equal(oldLogin.status, 200);
        assert.ok((await oldLogin.text()).includes('Email atau kata sandi salah.'), 'old password no longer works');

        const newLogin = await postForm('/login', '', { email: EMAIL, password: 'brand-new-pass-1' });
        assert.equal(newLogin.status, 302, 'new password signs in');
        thirdCookie = cookieOf(newLogin);
    });

    await t.test('device log persisted with a relational ref and parsed browser/os/engine', async () => {
        const user = await UserModel.findOne({ email: EMAIL }).lean().exec();
        assert.ok(user, 'better-auth user doc exists in the user collection');
        const rows = await DeviceLogModel.find({ ip: '203.0.113.42' }).lean().exec();
        const row = rows[0];
        assert.ok(rows.length >= 1, 'device rows exist for the ip');
        assert.equal(String(row?.userId), String(user?._id), 'device userId is an ObjectId referencing the auth user doc');
        assert.equal(row?.browser, 'Chrome', 'browser parsed from user-agent');
        assert.equal(row?.os, 'Windows', 'OS parsed from user-agent');
        assert.ok(typeof row?.engine === 'string' && row.engine.length > 0, 'engine parsed from user-agent');
        assert.equal(row?.ipVersion, 4);
        assert.equal(row?.authMethod, 'email/password');
        assert.equal(row?.deviceHash, deviceHashOf(String(user?._id), BROWSER_UA), 'device fingerprint is stable per user+UA');
        assert.match(row?.deviceHash ?? '', /^[0-9a-f]{40}$/, 'deviceHash is a 40-char sha1 hex');
    });

    await t.test('POST /account/revoke removes an out-of-date session', async () => {
        const session = await getSession(sessionCookie);
        const userId = session.user?.id;
        assert.ok(userId, 'user present in session');
        const devices = await deviceLogsOf(userId);
        const second = devices.find((d) => d.sessionToken !== session.session.token);
        assert.ok(second, 'device rows for a past login are recorded');

        const res = await postForm('/account/revoke', sessionCookie, { token: second.sessionToken });
        assert.equal(res.status, 302);
        assert.equal(res.headers.get('location'), '/account?flash=revoked');

        const afterRevoke = await deviceLogsOf(userId);
        assert.ok(!afterRevoke.some((d) => d.sessionToken === second.sessionToken), 'revoked session device row removed');

        const useRevoked = await req('/', secondCookie || thirdCookie);
        assert.equal(useRevoked.status, 302, 'revoked cookie can no longer access the app');
    });

    await t.test('POST /logout ends the session', async () => {
        const res = await postForm('/logout', sessionCookie, {});
        assert.equal(res.status, 302);
        assert.equal(res.headers.get('location'), '/login?flash=left');

        const home = await req('/login?flash=left', '');
        const html = await home.text();
        assert.ok(html.includes('Kamu sudah keluar'), 'logout flash message shown');

        const bounce = await req('/', sessionCookie);
        assert.equal(bounce.status, 302, 'logged-out cookie no longer authenticates');
    });

    await t.test('auth events audit trail is complete (sign-up, sign-in, failure, revoke, sign-out)', async () => {
        const user = await UserModel.findOne({ email: EMAIL }).lean().exec();
        assert.ok(user, 'user doc exists');

        const events = await AuthEventModel.find({ userId: user?._id }).sort({ createdAt: 1 }).lean().exec();
        const types = events.map((e) => `${e.type}:${e.success}`);

        assert.ok(types.includes('sign-up:true'), 'sign-up success recorded');
        assert.ok(types.includes('sign-in:true'), 'sign-in success recorded');
        assert.ok(types.includes('password-change:true'), 'password change recorded');
        assert.ok(types.includes('revoke:true'), 'revoke recorded');
        assert.ok(types.includes('sign-out:true'), 'sign-out recorded');
        assert.ok(!types.includes('sign-up:false'), 'no failed sign-up for the real account');

        const signUp = events.find((e) => e.type === 'sign-up');
        assert.equal(signUp?.browser, 'Chrome', 'sign-up event carries the browser');
        assert.equal(signUp?.os, 'Windows', 'sign-up event carries the OS');
        assert.equal(signUp?.ip, '203.0.113.42', 'sign-up event carries the IP');
        assert.equal(typeof signUp?.language, 'string', 'browser language captured');

        const failure = await AuthEventModel.findOne({ type: 'sign-in', success: false }).sort({ createdAt: -1 }).lean().exec();
        assert.ok(failure, 'failed sign-in attempt recorded');
        assert.equal(failure?.ip, '203.0.113.42', 'failure carries the IP too');
        assert.ok(String(failure?.reason ?? '').length > 0, 'failure records an Indonesian reason');

        const devices = await deviceLogsOf(String(user?._id));
        assert.ok(
            devices.every((d) => typeof d.language === 'string'),
            'device rows store the language field',
        );
    });

    await t.test('open-redirect guard: ?next=https://evil.example is ignored', async () => {
        const res = await req('/login?next=https%3A%2F%2Fevil.example', '');
        assert.equal(res.status, 200);
        const html = await res.text();
        assert.ok(!html.includes('https://evil.example'), 'external next is not rendered');
    });
});

async function getSession(cookie: string): Promise<{ user?: { id: string }; session: { token: string } }> {
    const { auth } = await import('../src/app/auth/auth.ts');
    const { fromNodeHeaders } = await import('better-auth/node');
    const session = await auth.api.getSession({ headers: fromNodeHeaders({ cookie }) });
    if (!session) throw new Error('session resolves for the cookie');
    return session;
}
