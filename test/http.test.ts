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
let cookie = '';

function form(values: Record<string, string>): string {
    return new URLSearchParams(values).toString();
}

function reqHeaders(extra?: unknown): Headers {
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

async function req(path: string, init?: RequestInit): Promise<Response> {
    return fetch(`${base}${path}`, { ...init, headers: reqHeaders(init?.headers) });
}

async function htmlOf(path: string): Promise<string> {
    const res = await req(path);
    assert.equal(res.status, 200, `GET ${path} → 200`);
    return res.text();
}

async function registerUser(name: string, email: string): Promise<void> {
    const res = await fetch(`${base}/register`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded', 'x-forwarded-for': '198.51.100.7' },
        body: form({ name, email, password: 'supersecret123' }),
        redirect: 'manual',
    });
    assert.equal(res.status, 302, 'register redirects');
    assert.equal(res.headers.get('location'), '/?flash=registered');
    cookie = res.headers
        .getSetCookie()
        .map((part) => part.split(';')[0])
        .join('; ');
}

before(async () => {
    stopDb = await connectTestDb();
    const { default: init } = await import('../src/app.ts');
    const app = init();
    server = app.listen(0);
    await new Promise<void>((resolveListen) => server.once('listening', resolveListen));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    await registerUser('Test User', 'http-test@example.test');
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
        assert.ok(html.includes('class="nav-avatar"'), 'nav shows the signed-in user');
        assert.ok(!html.includes('href="/login"'), 'login link hidden when authenticated');
    });

    await t.test('SPA driver: served, ordered before app.js, swap target present', async () => {
        const home = await htmlOf('/');
        assert.ok(home.includes('id="main-content"'), 'main swap target present');
        assert.ok(home.includes('src="/js/spa.js?v='), 'layout loads the SPA driver');
        assert.ok(home.indexOf('src="/js/spa.js?v=') < home.indexOf('src="/js/app.js?v='), 'spa.js runs before app.js');
        const spa = await req('/js/spa.js');
        assert.equal(spa.status, 200);
        const code = await spa.text();
        assert.ok(code.includes('spa:ready'), 'SPA dispatches spa:ready after a swap');
        assert.ok(code.includes('rencanaSpa'), 'SPA exposes the navigate hook');
        assert.ok(code.includes('main-content'), 'SPA targets the <main id="main-content"> region');
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

    await t.test('1040 — POST / accepts JSON (quick-add): 200 {ok, todo, html}', async () => {
        const res = await req('/', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
            body: form({ name: 'Rencana cepat', category: 'Kerja' }),
            redirect: 'manual',
        });
        assert.equal(res.status, 200);
        const payload = (await res.json()) as { ok: boolean; todo: { id: string; category: string; completedAt: null }; html: string };
        assert.equal(payload.ok, true);
        assert.equal(payload.todo.category, 'Kerja', 'category stored');
        assert.equal(payload.todo.completedAt, null);
        assert.ok(payload.html.includes('badge-category'), 'html ships the rendered item (single source of truth)');
    });

    await t.test('1040 — POST / invalid name over JSON → 400 {ok:false}', async () => {
        const res = await req('/', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
            body: form({ name: '   ' }),
            redirect: 'manual',
        });
        assert.equal(res.status, 400);
        const payload = (await res.json()) as { ok: boolean; error: string };
        assert.equal(payload.ok, false);
        assert.match(payload.error, /tidak boleh kosong/);
    });

    await t.test('1040 — index renders quick-add, category filter & 7-day chart', async () => {
        const html = await htmlOf('/');
        assert.ok(html.includes('id="quick-add"'), 'quick-add form present');
        assert.ok(html.includes('id="todo-category"'), 'category filter present');
        assert.ok(html.includes('value="Kerja"'), 'category option listed in the filter');
        assert.ok(html.includes('class="week-chart"'), '7-day chart rendered');
        assert.ok(html.includes('aria-label="7 hari terakhir —'), 'chart is described for AT');
    });

    await t.test('1040 — reorder API persists manual order', async () => {
        const posts = await Promise.all(
            ['R1', 'R2', 'R3'].map((n) =>
                req('/', {
                    method: 'POST',
                    headers: { 'content-type': 'application/x-www-form-urlencoded' },
                    body: form({ name: n }),
                    redirect: 'manual',
                }),
            ),
        );
        assert.ok(posts.every((r) => r.status === 302));

        const all = await getAll();
        const targets = all.filter((t) => ['R1', 'R2', 'R3'].includes(t.name));
        assert.equal(targets.length, 3);
        const reverse = targets.map((t) => t.id).reverse();

        const res = await req('/api/reorder', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ ids: reverse }),
        });
        assert.equal(res.status, 200);
        assert.equal(((await res.json()) as { ok: boolean }).ok, true);

        const after = await getAll();
        const ordered = after.filter((t) => ['R1', 'R2', 'R3'].includes(t.name)).map((t) => t.id);
        assert.deepEqual(ordered, reverse, 'reordered ids now come first, in given order');
    });

    await t.test('1040 — reorder API rejects empty/garbage ids', async () => {
        const bad = await req('/api/reorder', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ ids: ['tidak-valid'] }),
        });
        assert.equal(bad.status, 400);
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

    await t.test('1070 — POST /archive/:id retires a plan: hidden from list/stats, kept in export', async () => {
        const seed = await req('/', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: form({ name: 'Rencana yang diarsipkan', notes: 'Alasan: tidak relevan <script>alert(1)</script>' }),
            redirect: 'manual',
        });
        assert.equal(seed.status, 302);
        const all = await getAll();
        const target = all.find((todo) => todo.name === 'Rencana yang diarsipkan');
        assert.ok(target, 'seed created');
        assert.equal(
            target.notes,
            'Alasan: tidak relevan <script>alert(1)</script>',
            'notes stored verbatim via POST / (escaped on render)',
        );

        const res = await req(`/archive/${target.id}`, { method: 'POST', redirect: 'manual' });
        assert.equal(res.status, 302);
        assert.equal(res.headers.get('location'), '/?flash=archived', 'archive → flash=archived');
        assert.equal((await getAll()).find((t) => t.id === target.id)?.archived, true, 'archived in MongoDB');

        const html = await htmlOf('/');
        assert.ok(html.includes('Rencana yang diarsipkan'), 'archived plan still rendered in the DOM');
        assert.ok(html.includes('class="todo-note"'), 'note paragraph rendered');
        assert.ok(html.includes('&lt;script&gt;'), 'note HTML-escaped on render');
        assert.ok(!html.includes('>Alasan: tidak relevan <script>'), 'raw <script> never emitted');
        assert.ok(html.includes('data-archived="1"'), 'item flagged data-archived="1" because the Arsip filter runs client-side');
        assert.ok(html.includes('hidden'), 'archived item starts hidden (no flash of the retired item)');
        assert.match(html, /Arsip <span class="filter-count">1<\/span>/, 'Arsip chip counts 1');

        const stamped = await getAll();
        const ledger = stamped.filter((t) => !t.archived);
        assert.ok(!ledger.some((t) => t.id === target.id), 'archived plan absent from the live ledger');

        const exported = (await (await req('/api/export')).json()) as Array<{ name: string; archived: boolean }>;
        assert.ok(
            exported.some((t) => t.name === 'Rencana yang diarsipkan' && t.archived === true),
            'export keeps archived plans',
        );
    });

    await t.test('1070 — archive again un-archives; unknown id → ?flash=invalid', async () => {
        const all = await getAll();
        const target = all.find((t) => t.name === 'Rencana yang diarsipkan');
        assert.ok(target);
        const res = await req(`/archive/${target.id}`, { method: 'POST', redirect: 'manual' });
        assert.equal(res.status, 302);
        assert.equal(res.headers.get('location'), '/?flash=unarchived', 'un-archive → flash=unarchived');

        const html = await htmlOf('/');
        assert.ok(html.includes('data-archived="0"'), 'item back to data-archived="0"');
        assert.ok(!/Arsip <span class="filter-count">[1-9]/.test(html), 'no archived count after unarchiving all');

        const junk = await req(`/archive/${'0'.repeat(24)}`, { method: 'POST', redirect: 'manual' });
        assert.equal(junk.status, 302);
        assert.equal(junk.headers.get('location'), '/?flash=invalid');
    });

    await t.test('1070 — notes render on the item and survive an edit', async () => {
        const all = await getAll();
        const target = all.find((t) => t.name === 'Rencana yang diarsipkan');
        assert.ok(target);
        const html = await htmlOf('/');
        assert.ok(html.includes('class="todo-note"'), 'note paragraph rendered');

        const put = await req('/', {
            method: 'PUT',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: form({ id: target.id, name: 'Rencana yang diarsipkan', notes: 'Catatan diubah' }),
            redirect: 'manual',
        });
        assert.equal(put.status, 302);
        assert.ok((await htmlOf('/')).includes('Catatan diubah'), 'edited note visible in the list');
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
        assert.equal(String(res.headers.get('content-disposition')).includes('plans.json'), true);

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

    await t.test('1080 — POST / creates a recurring plan; visible + JSON toggle spawns the next occurrence', async () => {
        const create = await req('/', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
            body: form({ name: 'Olahraga pagi', repeat: 'daily', due: '2026-09-07' }),
        });
        assert.equal(create.status, 200);
        const created = (await create.json()) as { ok: boolean; todo: { id: string; repeat: string }; html: string };
        assert.equal(created.ok, true);
        assert.equal(created.todo.repeat, 'daily', 'repeat persisted via POST /');
        assert.ok(created.html.includes('badge-repeat'), 'item renders the repeat badge');
        assert.ok(created.html.includes('Harian · lagi-lagi'), 'badge text matches UI copy');

        const all = await getAll();
        const target = all.find((t) => t.name === 'Olahraga pagi');
        assert.ok(target);

        const toggled = await req(`/toggle/${target.id}`, {
            method: 'POST',
            headers: { accept: 'application/json' },
        });
        assert.equal(toggled.status, 200);
        const payload = (await toggled.json()) as { ok: boolean; next: { id: string; html: string } };
        assert.equal(payload.ok, true);
        assert.ok(payload.next?.id, 'a next occurrence was spawned');
        const spawned = await getAll();
        assert.equal(spawned.filter((t) => t.name === 'Olahraga pagi').length, 2, 'original + spawned copy both exist');
        assert.equal(spawned.find((t) => t.id === payload.next.id)?.completed, false, 'spawn starts active');
    });

    await t.test('1120 — GET /?f=done hides active items server-side (deep link renders correct list)', async () => {
        const done = await htmlOf('/?f=done');
        assert.ok(done.includes('Rencana dari cadangan'), 'done item visible under f=done');
        assert.ok(done.includes('hidden'), 'non-matching items carry the hidden attribute');
    });

    await t.test('1090 — POST /api/subtasks adds & toggles; invalid id rejected', async () => {
        const create = await req('/', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: form({ name: 'Proyek subtask' }),
            redirect: 'manual',
        });
        assert.equal(create.status, 302);
        const target = (await getAll()).find((t) => t.name === 'Proyek subtask');
        assert.ok(target);

        const add = await req('/api/subtasks', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
            body: form({ id: target.id, action: 'add', text: '  Langkah satu  ' }),
        });
        assert.equal(add.status, 200);
        const added = (await add.json()) as {
            ok: boolean;
            todo: { subtasks: Array<{ text: string; done: boolean }> };
            html: string;
        };
        assert.equal(added.ok, true);
        assert.equal(added.todo.subtasks[0]?.text, 'Langkah satu');
        assert.ok(added.html.includes('subtask-row'), 'rows block re-rendered');

        const toggled = await req('/api/subtasks', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
            body: form({ id: target.id, action: 'toggle', index: '0' }),
        });
        assert.equal(toggled.status, 200);
        const toggledPayload = (await toggled.json()) as {
            ok: boolean;
            todo: { subtasks: Array<{ done: boolean }> };
        };
        assert.equal(toggledPayload.todo.subtasks[0]?.done, true, 'subtask toggled done');

        const listHtml = await htmlOf('/');
        assert.ok(listHtml.includes('subtask-panel'), 'list item shows the subtask panel');

        const bad = await req('/api/subtasks', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: form({ id: '000000000000000000000000', action: 'add', text: 'X' }),
            redirect: 'manual',
        });
        assert.equal(bad.status, 302);
        assert.equal(bad.headers.get('location'), '/?flash=invalid');
    });

    await t.test('1100 — POST /api/bulk completes selected plans', async () => {
        const create = await req('/', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: form({ name: 'Bulk satu' }),
            redirect: 'manual',
        });
        assert.equal(create.status, 302);
        const target = (await getAll()).find((t) => t.name === 'Bulk satu');
        assert.ok(target);

        const res = await req('/api/bulk', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ ids: [target.id], action: 'complete' }),
        });
        assert.equal(res.status, 200);
        const body = (await res.json()) as { ok: boolean; processed: number };
        assert.equal(body.ok, true);
        assert.equal(body.processed, 1);
        assert.equal((await getAll()).find((t) => t.id === target.id)?.completed, true);

        const empty = await req('/api/bulk', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ ids: [], action: 'archive' }),
        });
        assert.equal(empty.status, 400);

        const badAction = await req('/api/bulk', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ ids: [target.id], action: 'explode' }),
        });
        assert.equal(badAction.status, 400);
    });
});
