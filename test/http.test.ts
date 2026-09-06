import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, before, test } from 'node:test';

let server: Server;
let base: string;
let dataFile: string;

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
    dataFile = join(mkdtempSync(join(tmpdir(), 'todo-http-')), 'todos.json');
    process.env.DATA_PATH = dataFile;
    const { default: init } = await import('../src/app.ts');
    const app = init();
    server = app.listen(0);
    await new Promise<void>((resolveListen) => server.once('listening', resolveListen));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(
    () =>
        new Promise<void>((resolveDone) => {
            server.close(() => {
                rmSync(dirname(dataFile), { recursive: true, force: true });
                resolveDone();
            });
        }),
);

test('rute HTTP end-to-end (server Express asli)', async (t) => {
    await t.test('991 — GET / saat kosong: 200, empty-state, lang=id', async () => {
        const html = await htmlOf('/');
        assert.ok(html.includes('Lembar masih'), 'empty-state tampil');
        assert.match(html, /lang="id"/);
    });

    await t.test('965/985/987 — POST / tambah; tersimpan ke disk; XSS di-escape di HTML', async () => {
        const payload = 'Beli susu <script>alert(1)</script>';
        const res = await req('/', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: form({ name: payload }),
            redirect: 'manual',
        });
        assert.equal(res.status, 302);
        assert.equal(res.headers.get('location'), '/?flash=created');

        const body = JSON.parse(readFileSync(dataFile, 'utf8')) as Array<{ name: string }>;
        assert.equal(body[0]?.name, payload, 'nilai tersimpan verbatim di JSON');

        const html = await htmlOf('/');
        assert.ok(html.includes('&lt;script&gt;'), 'rendering HTML meng-escape <script>');
        assert.ok(!html.includes('<script>alert(1)</script>'));
    });

    await t.test('988 — unicode/emoji diterima dan tampil', async () => {
        const name = 'Rencana 🎉 émoji ✓';
        const res = await req('/', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: form({ name }),
            redirect: 'manual',
        });
        assert.equal(res.status, 302);
        const html = await htmlOf('/');
        assert.ok(html.includes(`>${name}<`), `render nama unicode: ${name}`);
    });

    await t.test('990 — nama duplikat tetap diterima', async () => {
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
        assert.ok(count >= 2, `daftar memuat >1 duplikat (ditemukan ${count})`);
    });

    await t.test('989 — nama 201 karakter di-cap jadi 200 saat render', async () => {
        const res = await req('/', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: form({ name: 'a'.repeat(201) }),
            redirect: 'manual',
        });
        assert.equal(res.status, 302);
        const html = await htmlOf('/');
        assert.ok(html.includes('a'.repeat(200)), 'nama terpotong tepat 200 karakter');
    });

    await t.test('966 — PUT /?_method=PUT mengubah nama', async () => {
        const data = JSON.parse(readFileSync(dataFile, 'utf8')) as Array<{ id: string; name: string }>;
        const target = data.find((todo) => todo.name === 'Beli susu <script>alert(1)</script>');
        assert.ok(target, 'todo XSS ditemukan di data');

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

    await t.test('993 — POST /toggle/:id membalik status', async () => {
        const data = JSON.parse(readFileSync(dataFile, 'utf8')) as Array<{ id: string; name: string }>;
        const target = data.find((todo) => todo.name === 'Belanja pagi');
        assert.ok(target);

        assert.equal((await req(`/toggle/${target.id}`, { method: 'POST', redirect: 'manual' })).status, 302);
        const done = await htmlOf('/');
        assert.match(done, /is-done/, 'dicontreng setelah toggle');

        assert.equal((await req(`/toggle/${target.id}`, { method: 'POST', redirect: 'manual' })).status, 302);
        const undone = await htmlOf('/');
        assert.ok(!/class="todo-item[^"]*is-done/.test(undone), 'tidak is-done setelah toggle ulang');
    });

    await t.test('968 — id tak dikenal di-fallback ke 302 ?flash=invalid', async () => {
        const put = await req('/', {
            method: 'PUT',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: form({ id: '00000000-0000-0000-0000-000000000000', name: 'X' }),
            redirect: 'manual',
        });
        assert.equal(put.status, 302);
        assert.equal(put.headers.get('location'), '/?flash=invalid');

        assert.equal((await req(`/toggle/00000000-0000-0000-0000-000000000000`, { method: 'POST', redirect: 'manual' })).status, 302);
    });

    await t.test('967 — DELETE / menghapus dari daftar', async () => {
        const data = JSON.parse(readFileSync(dataFile, 'utf8')) as Array<{ id: string; name: string }>;
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

    await t.test('jalur UI — update & delete lewat override ?_method di query (bentuk form asli)', async () => {
        const seed = await req('/', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: form({ name: 'Untuk override' }),
            redirect: 'manual',
        });
        assert.equal(seed.status, 302);
        const data = JSON.parse(readFileSync(dataFile, 'utf8')) as Array<{ id: string; name: string }>;
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
        assert.match(await htmlOf('/'), /Untuk override \(berubah\)/, 'PUT via ?_method=PUT mengubah nama');

        const del = await req(`/?_method=DELETE`, {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: form({ id: target.id }),
            redirect: 'manual',
        });
        assert.equal(del.status, 302);
        assert.equal(del.headers.get('location'), '/?flash=deleted');
        const html = await htmlOf('/');
        assert.ok(!html.includes('Untuk override'), 'DELETE via ?_method=DELETE menghapus');
    });

    await t.test('970 — rute tak dikenal → halaman 404 (status 404)', async () => {
        const res = await req('/halaman-tak-ada');
        assert.equal(res.status, 404);
        const html = await res.text();
        assert.ok(html.includes('Kesalahan 404'));
    });

    await t.test('964/971 — render GET / dan /add-todo keduanya 200', async () => {
        const home = await htmlOf('/');
        assert.ok(home.includes('Apa rencanamu'));
        const add = await htmlOf('/add-todo');
        assert.ok(add.includes('Apa yang ingin'));
    });

    await t.test('981 — smoke produksi: health-check + API root 200', async () => {
        const health = await req('/api/health-check');
        assert.equal(health.status, 200);
        const body = (await health.json()) as { success: boolean; message: string; data: { status: string } };
        assert.equal(body.success, true);
        assert.equal(body.data.status, 'UP');

        const api = await req('/api');
        assert.equal(api.status, 200);

        const csp = health.headers.get('content-security-policy') ?? '';
        assert.ok(csp.includes("script-src 'self' 'nonce-"), 'CSP memuat nonce per-request');
        assert.ok(
            !csp.includes('upgrade-insecure-requests'),
            'CSP TANPA upgrade-insecure-requests (merusak redirect fetch async di HTTP lokal)',
        );
    });

    await t.test('1030 — GET /api/export mengunduh semua data sebagai JSON', async () => {
        const res = await req('/api/export');
        assert.equal(res.status, 200);
        assert.ok(String(res.headers.get('content-type')).startsWith('application/json'));
        assert.equal(String(res.headers.get('content-disposition')).includes('todos.json'), true);

        const todos = (await res.json()) as Array<{ name: string }>;
        assert.ok(todos.length >= 3, `sisa data belum kosong (${todos.length})`);
        assert.ok(
            todos.some((todo) => todo.name === 'a'.repeat(200)),
            'nama 200 karakter ikut ter-ekspor',
        );
    });

    await t.test('1030 — POST /api/import valid mengganti seluruh data', async () => {
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
        assert.ok(html.includes('Rencana dari cadangan'), 'spasi berlebihan dirapikan oleh sanitiser');
        assert.ok(html.includes('Tanpa id &amp; tanggal'), '& di-escape saat render');
        assert.ok(!html.includes('a'.repeat(200)), 'data lama benar-benar diganti');
    });

    await t.test('1030 — POST /api/import menolak payload tidak valid tanpa menyentuh data', async () => {
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
        assert.ok(html.includes('Rencana dari cadangan'), 'data tetap utuh setelah penolakan');
    });

    await t.test('1030 — POST /api/import menolak melebihi MAX_TODOS (dan melampaui batas body global)', async () => {
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
