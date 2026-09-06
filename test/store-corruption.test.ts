import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';

let store: typeof import('../src/app/store/todo.store.ts');
let dir: string;
let dataFile: string;

before(async () => {
    process.env.NODE_ENV = 'production';
    dir = mkdtempSync(join(tmpdir(), 'todo-store-'));
    dataFile = join(dir, 'todos.json');
    process.env.DATA_PATH = dataFile;
    store = await import('../src/app/store/todo.store.ts');
});

after(() => rmSync(dir, { recursive: true, force: true }));

test('969 — JSON korup di startup: dibackup .bak lalu mulai dari kosong', () => {
    writeFileSync(dataFile, '{ ini bukan json', 'utf8');
    assert.deepEqual(store.readTodos(), []);
    assert.ok(readdirSync(dir).includes('todos.json.bak'), 'file .bak dibuat');

    store.writeTodos([{ id: '1', name: 'Pulih', completed: false, createdAt: 'x', updatedAt: 'x' }]);
    assert.equal(store.readTodos()[0]?.name, 'Pulih');
});

test('961 — writeTodos flush ke file & buffer ter-update', () => {
    store.writeTodos([]);
    assert.equal(store.readTodos().length, 0);
    const todos = [
        { id: 'a', name: 'Satu', completed: false, createdAt: 't', updatedAt: 't' },
        { id: 'b', name: 'Dua', completed: true, createdAt: 't', updatedAt: 't', due: '2026-09-09' },
    ];
    store.writeTodos(todos);
    assert.deepEqual(store.readTodos(), todos);
});
