import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, before, test } from 'node:test';

let store: typeof import('../src/app/store/todo.store.ts');
let dataFile: string;

before(async () => {
    process.env.NODE_ENV = 'production';
    dataFile = join(mkdtempSync(join(tmpdir(), 'todo-legacy-')), 'todos.json');
    process.env.DATA_PATH = dataFile;
    store = await import('../src/app/store/todo.store.ts');
});

after(() => rmSync(dirname(dataFile), { recursive: true, force: true }));

test('961/969 — data lama tanpa field wajib dinormalisasi (ensureDefaults)', () => {
    writeFileSync(dataFile, JSON.stringify([{ name: 'Rencana lama' }, { id: 'custom', name: 'Dikecualikan', priority: 'high' }]), 'utf8');
    const todos = store.readTodos();
    assert.equal(todos.length, 2);

    const first = todos[0];
    assert.equal(first?.id, '1', 'id dibuatkan bila kosong');
    assert.equal(first?.completed, false, 'completed default false');
    assert.equal(first?.due, null, 'due default null');
    assert.ok(first?.createdAt && first?.updatedAt, 'stempel waktu dibuatkan');

    const second = todos[1];
    assert.equal(second?.id, 'custom');
    assert.equal(second?.priority, 'high');
});
