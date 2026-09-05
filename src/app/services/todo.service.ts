import { randomUUID } from 'node:crypto';
import type { Todo } from '../../interfaces/todo.ts';
import { readTodos, writeTodos } from '../store/todo.store.ts';

export function getAll(): Todo[] {
    return readTodos();
}

export function getById(id: string): Todo | null {
    return readTodos().find((todo) => todo.id === id) ?? null;
}

export function create(name: string): Todo {
    const todos = readTodos();
    const now = new Date().toISOString();
    const todo: Todo = { id: randomUUID(), name, createdAt: now, updatedAt: now };
    todos.push(todo);
    writeTodos(todos);
    return todo;
}

export function update(id: string, name: string): Todo | null {
    const todos = readTodos();
    const index = todos.findIndex((todo) => todo.id === id);
    if (index === -1) return null;
    todos[index] = { ...todos[index], name, updatedAt: new Date().toISOString() };
    writeTodos(todos);
    return todos[index];
}

export function remove(id: string): boolean {
    const todos = readTodos();
    const filtered = todos.filter((todo) => todo.id !== id);
    if (filtered.length === todos.length) return false;
    writeTodos(filtered);
    return true;
}
