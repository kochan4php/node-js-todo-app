import { randomUUID } from 'node:crypto';
import { MAX_TODOS } from '../../config/app.ts';
import type { Priority, Todo } from '../../interfaces/todo.ts';
import { logger } from '../../logger/index.ts';
import { readTodos, writeTodos } from '../store/todo.store.ts';

type CreatedTodo = {
    name: string;
    priority?: Priority;
    due?: string | null;
};

export function getAll(): Todo[] {
    const todos = readTodos();
    return [...todos].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return b.createdAt.localeCompare(a.createdAt);
    });
}

export function getById(id: string): Todo | null {
    return readTodos().find((todo) => todo.id === id) ?? null;
}

export function create(name: string, priority?: Priority, due?: string | null): Todo | null {
    const todos = readTodos();
    if (todos.length >= MAX_TODOS) return null;
    const now = new Date().toISOString();
    const todo: Todo = { id: randomUUID(), name, completed: false, createdAt: now, updatedAt: now, priority, due: due ?? null };
    todos.push(todo);
    writeTodos(todos); /* 723 — audit jalur */
    logger.info(`Tambah ${todo.name}`);
    return todo;
}

export function update(id: string, name: string, priority?: Priority, due?: string | null): Todo | null {
    const todos = readTodos();
    const index = todos.findIndex((todo) => todo.id === id);
    if (index === -1) return null;
    todos[index] = { ...todos[index], name, priority, due: due ?? null, updatedAt: new Date().toISOString() };
    writeTodos(todos);
    logger.info(`Ubah ${id}`);
    return todos[index];
}

export function restore(saved: CreatedTodo & { completed: boolean; createdAt: string }): Todo | null {
    const todos = readTodos();
    if (todos.length >= MAX_TODOS) return null;
    const now = new Date().toISOString();
    const todo: Todo = {
        id: randomUUID(),
        name: saved.name,
        completed: saved.completed,
        createdAt: saved.createdAt || now,
        updatedAt: now,
        priority: saved.priority,
        due: saved.due ?? null,
    };
    todos.push(todo);
    writeTodos(todos);
    logger.info(`Pulihkan ${saved.name}`);
    return todo;
}

export function toggle(id: string): Todo | null {
    const todos = readTodos();
    const index = todos.findIndex((todo) => todo.id === id);
    if (index === -1) return null;
    todos[index] = { ...todos[index], completed: !todos[index].completed, updatedAt: new Date().toISOString() };
    writeTodos(todos);
    logger.info(`Selesaikan ${id}`);
    return todos[index];
}

export function remove(id: string): boolean {
    const todos = readTodos();
    const filtered = todos.filter((todo) => todo.id !== id);
    if (filtered.length === todos.length) return false;
    writeTodos(filtered);
    logger.info(`Hapus ${id}`);
    return true;
}
