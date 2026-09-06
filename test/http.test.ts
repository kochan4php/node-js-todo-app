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
    });
});
