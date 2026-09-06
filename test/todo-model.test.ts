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

test('969 — schema defaults: completed false, due null, timestamps set, priority optional', async () => {
    const doc = await TodoModel.create({ name: 'Rencana minimalis' });
    assert.equal(doc.name, 'Rencana minimalis');
    assert.equal(doc.completed, false, 'completed default false');
    assert.equal(doc.due, null, 'due default null');
    assert.equal(doc.priority, undefined, 'priority optional');
    assert.ok(doc.createdAt instanceof Date, 'createdAt set by mongoose');
    assert.ok(doc.updatedAt instanceof Date, 'updatedAt set by mongoose');
});

test('969 — priority enum rejects unknown values (ODM schema)', async () => {
    const doc = new TodoModel({ name: 'Prioritas aneh', priority: 'urgent' } as never);
    await assert.rejects(() => doc.save(), /priority/, 'enum validation rejects "urgent"');
});
