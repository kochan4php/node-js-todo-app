import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';

let svc: typeof import('../src/app/services/todo.service.ts');
let store: typeof import('../src/app/store/todo.store.ts');
let dataFile: string;
let dir: string;

before(async () => {
    process.env.NODE_ENV = 'production';
    process.env.TODOS_LIMIT = '5';
    dir = mkdtempSync(join(tmpdir(), 'todo-svc-'));
    dataFile = join(dir, 'todos.json');
    process.env.DATA_PATH = dataFile;
    svc = await import('../src/app/services/todo.service.ts');
    store = await import('../src/app/store/todo.store.ts');
});

after(() => rmSync(dir, { recursive: true, force: true }));

function reset(): void {
    store.writeTodos([]);
}

test('961/962 — CRUD: create → getById → update → toggle → remove', () => {
    reset();
    const created = svc.create('Belajar Node');
    assert.ok(created);
    assert.equal(created.id.length, 36, 'id berupa UUID v4');
    assert.equal(svc.getById(created.id)?.name, 'Belajar Node');
    assert.equal(svc.getById('tidak-ada'), null);

    const updated = svc.update(created.id, 'Belajar Express');
    assert.equal(updated?.name, 'Belajar Express');
    assert.equal(svc.update('tidak-ada', 'Apa pun'), null);

    assert.equal(svc.toggle(created.id)?.completed, true);
    assert.equal(svc.toggle(created.id)?.completed, false);
    assert.equal(svc.toggle('tidak-ada'), null);

    assert.equal(svc.remove(created.id), true);
    assert.equal(svc.remove(created.id), false);
    assert.equal(svc.getById(created.id), null);
});

test('962/992 — getAll: aktif dahulu, tiap kelompok terbaru di depan', () => {
    reset();
    /* restore() menerima createdAt eksplisit → urutan deterministik (bukan mslama). */
    const a = svc.restore({ name: 'Rencana A', completed: false, createdAt: '2026-01-01T00:00:00.000Z' });
    const b = svc.restore({ name: 'Rencana B', completed: false, createdAt: '2026-01-02T00:00:00.000Z' });
    const c = svc.restore({ name: 'Rencana C', completed: false, createdAt: '2026-01-03T00:00:00.000Z' });
    assert.ok(a);
    assert.ok(b);
    assert.ok(c);
    assert.deepEqual(
        svc.getAll().map((t) => t.id),
        [c.id, b.id, a.id],
    );

    svc.toggle(c.id);
    assert.deepEqual(
        svc.getAll().map((t) => t.id),
        [b.id, a.id, c.id],
    );
    assert.equal(svc.getAll().at(-1)?.completed, true);
});

test('962 — getAll saat persediaan kosong → []', () => {
    reset();
    assert.deepEqual(svc.getAll(), []);
});

test('985 — mutasi langsung ter-flush ke file (tidak hanya buffer)', () => {
    reset();
    svc.create('Flush ke disk');
    const onDisk = JSON.parse(readFileSync(dataFile, 'utf8')) as unknown[];
    assert.equal(onDisk.length, 1);
    svc.create('Flush lagi');
    assert.equal((JSON.parse(readFileSync(dataFile, 'utf8')) as string[]).length, 2);
});

test('986 — guard batas MAX_TODOS (TODOS_LIMIT=5): yang ke-6 ditolak', () => {
    reset();
    for (let i = 0; i < 5; i++) assert.ok(svc.create(`Rencana ke-${i}`), `bisa menambah ke-${i + 1}`);
    assert.equal(svc.create('Rencana ke-6'), null);
    assert.equal(svc.restore({ name: 'Pulih ke-6', completed: false, createdAt: 't' }), null);
});

test('988/990 — unicode & nama duplikat diterima', () => {
    reset();
    svc.create('Sama');
    svc.create('Sama');
    svc.create('Rencana 🎉 émoji ✓');
    const names = svc.getAll().map((t) => t.name);
    assert.equal(names.filter((n) => n === 'Sama').length, 2);
    assert.ok(names.includes('Rencana 🎉 émoji ✓'));
});

test('962 — restore: simpan lengkap + counter batas juga berlaku', () => {
    reset();
    const t = svc.restore({ name: 'Pulihkan', completed: true, createdAt: new Date().toISOString(), priority: 'high', due: null });
    assert.ok(t);
    assert.equal(t.completed, true);
    assert.equal(t.priority, 'high');
    assert.equal(t.due, null);
});
