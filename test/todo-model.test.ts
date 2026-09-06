import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { TodoModel } from '../src/app/models/todo.model.ts';
import { connectTestDb, type StopFn } from './helpers/mongo.ts';

let stopDb: StopFn;

before(async () => {
    stopDb = await connectTestDb();
});

after(async () => {
    await stopDb();
});

test('969 — defaults skema: completed false, due null, stempel waktu diisi, prioritas opsional', async () => {
    const doc = await TodoModel.create({ name: 'Rencana minimalis' });
    assert.equal(doc.name, 'Rencana minimalis');
    assert.equal(doc.completed, false, 'completed default false');
    assert.equal(doc.due, null, 'due default null');
    assert.equal(doc.priority, undefined, 'prioritas opsional');
    assert.ok(doc.createdAt instanceof Date, 'createdAt diisi mongoose');
    assert.ok(doc.updatedAt instanceof Date, 'updatedAt diisi mongoose');
});

test('969 — enum prioritas menolak nilai tak dikenal (skema ODM)', async () => {
    const doc = new TodoModel({ name: 'Prioritas aneh', priority: 'urgent' } as never);
    await assert.rejects(() => doc.save(), /priority/, 'validasi enum menolak "urgent"');
});
