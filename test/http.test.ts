import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, test } from 'node:test';
import { getAll } from '../src/app/services/todo.service.ts';
import type { Todo } from '../src/interfaces/todo.ts';
import { connectTestDb, type StopFn } from './helpers/mongo.ts';

let server: Server;
let base: string;
let stopDb: StopFn;

function form(values: Record<string, string>): string {
    return new URLSearchParams(values).toString();
}

async function req(path: string, init?: RequestInit): Promise<Response> {
    return fetch(`${base}${path}`, init);
}

async function htmlOf(path: string): Promise<string> {
    const res = await req(path);
    assert.equal(res.status, 200, `GET ${path} → 200`);
    return res.text();
}

before(async () => {
    process.env.NODE_ENV = 'production';
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

test('HTTP routes end-to-end (real Express server + MongoDB) ', async (t) => {
    await t.test('991 — GET / when empty: 200, empty-state, lang=id', async () => {
        const html = await htmlOf('/');
        assert.ok(html.includes('Lembar masih'), 'empty-state displayed');
        assert.match(html, /lang="id"/);
    });

    await t.test('965/985/987 — POST / creates; persisted in MongoDB; XSS escaped in HTML', async () => {
        const payload = 'Beli susu <script>alert(1)</script>';
        const res = await req('/', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: form({ name: payload }),
            redirect: 'manual',
        });
        assert.equal(res.status, 302);
        assert.equal(res.headers.get('location'), '/?flash=created');

        const todos = await getAll();
        assert.equal(todos[0]?.name, payload, 'value stored verbatim in MongoDB');

        const html = await htmlOf('/');
        assert.ok(html.includes('&lt;script&gt;'), 'HTML rendering escapes <script>');
        assert.ok(!html.includes('<script>alert(1)</script>'));
    });

    await t.test('988 — unicode/emoji accepted and rendered', async () => {
        const name = 'Rencana 🎉 émoji ✓';
        const res = await req('/', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: form({ name }),
            redirect: 'manual',
        });
        assert.equal(res.status, 302);
        const html = await htmlOf('/');
        assert.ok(html.includes(`>${name}<`), `html renders unicode name: ${name}`);
    });

    await t.test('990 — duplicate names still accepted', async () => {
        const name = 'Rencana 🎉 émoji ✓';
        const res = await req('/', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: form({ name }),
            redirect: 'manual',
        });
        assert.equal(res.status, 302);
        const html = await htmlOf('/');
        const count = (html.match(/>Rencana 🎉 émoji ✓</g) ?? []).length;
        assert.ok(count >= 2, `list shows >1 duplicate (found ${count})`);
    });

    await t.test('989 — 201-char name capped to 200 on render', async () => {
        const res = await req('/', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: form({ name: 'a'.repeat(201) }),
            redirect: 'manual',
        });
        assert.equal(res.status, 302);
        const html = await htmlOf('/');
        assert.ok(html.includes('a'.repeat(200)), 'name cut to exactly 200 characters');
    });

    await t.test('966 — PUT /?_method=PUT renames the todo', async () => {
        const data = await getAll();
        const target = data.find((todo) => todo.name === 'Beli susu <script>alert(1)</script>');
        assert.ok(target, 'XSS todo found in data');

        const res = await req('/', {
            method: 'PUT',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: form({ id: target.id, name: 'Belanja pagi' }),
            redirect: 'manual',
        });
        assert.equal(res.status, 302);
        assert.equal(res.headers.get('location'), '/?flash=updated');

        const html = await htmlOf('/');
        assert.ok(html.includes('Belanja pagi'));
        assert.ok(!html.includes('Beli susu &lt;script&gt;'));
    });

    await t.test('993 — POST /toggle/:id flips the status', async () => {
        const data = await getAll();
        const target = data.find((todo) => todo.name === 'Belanja pagi');
        assert.ok(target);

        assert.equal((await req(`/toggle/${target.id}`, { method: 'POST', redirect: 'manual' })).status, 302);
        const done = await htmlOf('/');
        assert.match(done, /is-done/, 'checked after toggle');

        assert.equal((await req(`/toggle/${target.id}`, { method: 'POST', redirect: 'manual' })).status, 302);
        const undone = await htmlOf('/');
        assert.ok(!/class="todo-item[^"]*is-done/.test(undone), 'not is-done after toggling back');
    });

    await t.test('968 — unknown id falls back to 302 ?flash=invalid', async () => {
        const put = await req('/', {
            method: 'PUT',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: form({ id: '000000000000000000000000', name: 'X' }),
            redirect: 'manual',
        });
        assert.equal(put.status, 302);
        assert.equal(put.headers.get('location'), '/?flash=invalid');

        assert.equal((await req(`/toggle/000000000000000000000000`, { method: 'POST', redirect: 'manual' })).status, 302);
    });

    await t.test('967 — DELETE / removes from the list', async () => {
        const data = await getAll();
        const target = data.find((todo) => todo.name === 'Belanja pagi');
        assert.ok(target);

        const res = await req('/', {
            method: 'DELETE',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: form({ id: target.id }),
            redirect: 'manual',
        });
        assert.equal(res.status, 302);
        assert.equal(res.headers.get('location'), '/?flash=deleted');

        const html = await htmlOf('/');
        assert.ok(!html.includes('Belanja pagi'));
    });

    await t.test('UI path — update & delete via ?_method query override (native form shape)', async () => {
        const seed = await req('/', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: form({ name: 'Untuk override' }),
            redirect: 'manual',
        });
        assert.equal(seed.status, 302);
        const data = await getAll();
        const target = data.find((todo) => todo.name === 'Untuk override');
        assert.ok(target);

        const update = await req(`/?_method=PUT`, {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: form({ id: target.id, name: 'Untuk override (berubah)' }),
            redirect: 'manual',
        });
        assert.equal(update.status, 302);
        assert.equal(update.headers.get('location'), '/?flash=updated');
        assert.match(await htmlOf('/'), /Untuk override \(berubah\)/, 'PUT via ?_method=PUT renames');

        const del = await req(`/?_method=DELETE`, {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: form({ id: target.id }),
            redirect: 'manual',
        });
        assert.equal(del.status, 302);
        assert.equal(del.headers.get('location'), '/?flash=deleted');
        const html = await htmlOf('/');
        assert.ok(!html.includes('Untuk override'), 'DELETE via ?_method=DELETE removes');
    });

    await t.test('970 — unknown route → 404 page (status 404)', async () => {
        const res = await req('/halaman-tak-ada');
        assert.equal(res.status, 404);
        const html = await res.text();
        assert.ok(html.includes('Kesalahan 404'));
    });

    await t.test('964/971 — render GET / and /add-todo, both 200', async () => {
        const home = await htmlOf('/');
        assert.ok(home.includes('Apa rencanamu'));
        const add = await htmlOf('/add-todo');
        assert.ok(add.includes('Apa yang ingin'));
    });

    await t.test('981 — production smoke: health-check confirms DB connected + API root 200', async () => {
        const health = await req('/api/health-check');
        assert.equal(health.status, 200);
        const body = (await health.json()) as { success: boolean; message: string; data: { status: string; db: string } };
        assert.equal(body.success, true);
        assert.equal(body.data.status, 'UP');
        assert.equal(body.data.db, 'connected');

        const api = await req('/api');
        assert.equal(api.status, 200);

        const csp = health.headers.get('content-security-policy') ?? '';
        assert.ok(csp.includes("script-src 'self' 'nonce-"), 'CSP carries a per-request nonce');
        assert.ok(
            !csp.includes('upgrade-insecure-requests'),
            'CSP WITHOUT upgrade-insecure-requests (breaks async fetch redirects over local HTTP)',
        );
    });

    await t.test('1030 — GET /api/export downloads all data as JSON', async () => {
        const res = await req('/api/export');
        assert.equal(res.status, 200);
        assert.ok(String(res.headers.get('content-type')).startsWith('application/json'));
        assert.equal(String(res.headers.get('content-disposition')).includes('todos.json'), true);

        const todos = (await res.json()) as Array<{ name: string }>;
        assert.ok(todos.length >= 3, `remnant data not empty (${todos.length})`);
        assert.ok(
            todos.some((todo) => todo.name === 'a'.repeat(200)),
            '200-char name included in export',
        );
    });

    await t.test('1030 — POST /api/import with valid payload replaces all data', async () => {
        const payload = [
            {
                id: 'abc-1',
                name: '  Rencana   dari   cadangan  ',
                completed: true,
                priority: 'high',
                due: '2026-09-09',
                createdAt: '2026-01-01T00:00:00.000Z',
            },
            { name: 'Tanpa id & tanggal', completed: false },
        ];
        const res = await req('/api/import', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
        });
        assert.equal(res.status, 200);
        const body = (await res.json()) as { success: boolean; data: { imported: number } };
        assert.equal(body.success, true);
        assert.equal(body.data.imported, 2);

        const html = await htmlOf('/');
        assert.ok(html.includes('Rencana dari cadangan'), 'excess spaces collapsed by the sanitizer');
        assert.ok(html.includes('Tanpa id &amp; tanggal'), '& escaped on render');
        assert.ok(!html.includes('a'.repeat(200)), 'old data fully replaced');

        const persisted = await getAll();
        assert.ok(
            persisted.every((todo: Todo) => todo.name !== 'a'.repeat(200)),
            'old data also gone from MongoDB',
        );
    });

    await t.test('1030 — POST /api/import rejects invalid payload without touching data', async () => {
        const notArray = await req('/api/import', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ nama: 'bukan array' }),
        });
        assert.equal(notArray.status, 400);

        const noName = await req('/api/import', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify([{ name: '   ' }]),
        });
        assert.equal(noName.status, 400);

        const nullItem = await req('/api/import', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify([null]),
        });
        assert.equal(nullItem.status, 400);

        const html = await htmlOf('/');
        assert.ok(html.includes('Rencana dari cadangan'), 'data intact after rejection');
    });

    await t.test('1030 — POST /api/import rejects payloads over MAX_TODOS (and over the global body limit)', async () => {
        const items = Array.from({ length: 1001 }, (_, i) => ({ name: `x${i}` }));
        const res = await req('/api/import', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(items),
        });
        assert.equal(res.status, 400);
        const body = (await res.json()) as { success: boolean; message: string };
        assert.equal(body.success, false);
        assert.match(body.message, /Maksimal 1000/);
    });
});
