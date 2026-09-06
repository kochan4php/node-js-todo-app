import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { TodoModel } from '../src/app/models/todo.model.ts';
import { connectTestDb, type StopFn } from './helpers/mongo.ts';

let svc: typeof import('../src/app/services/todo.service.ts');
let stopDb: StopFn;

before(async () => {
    process.env.NODE_ENV = 'production';
    process.env.TODOS_LIMIT = '5';
    stopDb = await connectTestDb();
    svc = await import('../src/app/services/todo.service.ts');
});

after(async () => {
    await stopDb();
});

async function reset(): Promise<void> {
    await TodoModel.deleteMany({});
}

test('961/962 — CRUD: create → getById → update → toggle → remove', async () => {
    await reset();
    const created = await svc.create('Belajar Node');
    assert.ok(created);
    assert.equal(created.id.length, 24, 'id is an ObjectId hex (MongoDB)');
    assert.equal((await svc.getById(created.id))?.name, 'Belajar Node');
    assert.equal(await svc.getById('tidak-ada'), null);

    const updated = await svc.update(created.id, 'Belajar Express');
    assert.equal(updated?.name, 'Belajar Express');
    assert.equal(await svc.update('tidak-ada', 'Apa pun'), null);

    assert.equal((await svc.toggle(created.id))?.completed, true);
    assert.equal((await svc.toggle(created.id))?.completed, false);
    assert.equal(await svc.toggle('tidak-ada'), null);

    assert.equal(await svc.remove(created.id), true);
    assert.equal(await svc.remove(created.id), false);
    assert.equal(await svc.getById(created.id), null);
});

test('962/992 — getAll: active first, latest within each group', async () => {
    await reset();
    /* restore() takes an explicit createdAt → deterministic order. */
    const a = await svc.restore({ name: 'Rencana A', completed: false, createdAt: '2026-01-01T00:00:00.000Z' });
    const b = await svc.restore({ name: 'Rencana B', completed: false, createdAt: '2026-01-02T00:00:00.000Z' });
    const c = await svc.restore({ name: 'Rencana C', completed: false, createdAt: '2026-01-03T00:00:00.000Z' });
    assert.ok(a);
    assert.ok(b);
    assert.ok(c);
    assert.deepEqual(
        (await svc.getAll()).map((t) => t.id),
        [c.id, b.id, a.id],
    );

    await svc.toggle(c.id);
    assert.deepEqual(
        (await svc.getAll()).map((t) => t.id),
        [b.id, a.id, c.id],
    );
    assert.equal((await svc.getAll()).at(-1)?.completed, true);
});

test('962 — getAll with an empty store → []', async () => {
    await reset();
    assert.deepEqual(await svc.getAll(), []);
});

test('985 — mutations persist straight to MongoDB (not just memory)', async () => {
    await reset();
    await svc.create('Flush ke DB');
    assert.equal(await TodoModel.countDocuments(), 1);
    await svc.create('Flush lagi');
    assert.equal(await TodoModel.countDocuments(), 2);
    const name = (await TodoModel.findOne({ name: 'Flush lagi' }).lean())?.name;
    assert.equal(name, 'Flush lagi');
});

test('986 — MAX_TODOS guard (TODOS_LIMIT=5): the 6th is rejected', async () => {
    await reset();
    for (let i = 0; i < 5; i++) assert.ok(await svc.create(`Rencana ke-${i}`), `can add #${i + 1}`);
    assert.equal(await svc.create('Rencana ke-6'), null);
    assert.equal(await svc.restore({ name: 'Pulih ke-6', completed: false, createdAt: 't' }), null);
});

test('988/990 — unicode & duplicate names accepted', async () => {
    await reset();
    await svc.create('Sama');
    await svc.create('Sama');
    await svc.create('Rencana 🎉 émoji ✓');
    const names = (await svc.getAll()).map((t) => t.name);
    assert.equal(names.filter((n) => n === 'Sama').length, 2);
    assert.ok(names.includes('Rencana 🎉 émoji ✓'));
});

test('962 — restore: full save, the limit counter also applies', async () => {
    await reset();
    const t = await svc.restore({ name: 'Pulihkan', completed: true, createdAt: new Date().toISOString(), priority: 'high', due: null });
    assert.ok(t);
    assert.equal(t.completed, true);
    assert.equal(t.priority, 'high');
    assert.equal(t.due, null);
});
