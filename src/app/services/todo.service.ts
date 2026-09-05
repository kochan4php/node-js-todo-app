import { randomUUID } from 'node:crypto';
import type { Todo } from '../../interfaces/todo.ts';
import { readTodos, writeTodos } from '../store/todo.store.ts';

export const MAX_TODOS = 1000;

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

export function create(name: string): Todo | null {
    const todos = readTodos();
    if (todos.length >= MAX_TODOS) return null;
    const now = new Date().toISOString();
    const todo: Todo = { id: randomUUID(), name, completed: false, createdAt: now, updatedAt: now };
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

export function toggle(id: string): Todo | null {
    const todos = readTodos();
    const index = todos.findIndex((todo) => todo.id === id);
    if (index === -1) return null;
    todos[index] = { ...todos[index], completed: !todos[index].completed, updatedAt: new Date().toISOString() };
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
