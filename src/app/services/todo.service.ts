import mongoose from 'mongoose';
import { MAX_TODOS } from '../../config/app.ts';
import type { Priority, Todo } from '../../interfaces/todo.ts';
import { logger } from '../../logger/index.ts';
import { TodoModel, toTodo } from '../models/todo.model.ts';

type CreatedTodo = {
    name: string;
    priority?: Priority;
    due?: string | null;
};

export type ImportItem = {
    name: string;
    completed: boolean;
    priority?: Priority;
    due?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
};

function validId(id: string): boolean {
    return mongoose.isValidObjectId(id);
}

export async function getAll(): Promise<Todo[]> {
    const docs = await TodoModel.find().sort({ completed: 1, createdAt: -1 }).lean();
    return docs.map((doc) => toTodo(doc as unknown as Parameters<typeof toTodo>[0]));
}

export async function getById(id: string): Promise<Todo | null> {
    if (!validId(id)) return null;
    const doc = await TodoModel.findById(id).lean();
    return doc ? toTodo(doc as unknown as Parameters<typeof toTodo>[0]) : null;
}

async function insertOne(item: {
    name: string;
    completed: boolean;
    priority?: Priority;
    due?: string | null;
    createdAt?: Date;
}): Promise<Todo | null> {
    const count = await TodoModel.countDocuments();
    if (count >= MAX_TODOS) return null;
    const doc = await TodoModel.create(item);
    logger.info(`Added ${item.name}`);
    return toTodo(doc);
}

export function create(name: string, priority?: Priority, due?: string | null): Promise<Todo | null> {
    return insertOne({ name, completed: false, priority, due: due ?? null });
}

export function restore(saved: CreatedTodo & { completed: boolean; createdAt: string }): Promise<Todo | null> {
    const createdAt = saved.createdAt ? new Date(saved.createdAt) : undefined;
    return insertOne({ name: saved.name, completed: saved.completed, createdAt, priority: saved.priority, due: saved.due ?? null });
}

export async function update(id: string, name: string, priority?: Priority, due?: string | null): Promise<Todo | null> {
    if (!validId(id)) return null;
    const doc = await TodoModel.findById(id);
    if (!doc) return null;
    doc.name = name;
    doc.priority = priority;
    doc.due = due ?? null;
    await doc.save();
    logger.info(`Updated ${id}`);
    return toTodo(doc);
}

export async function toggle(id: string): Promise<Todo | null> {
    if (!validId(id)) return null;
    const doc = await TodoModel.findById(id);
    if (!doc) return null;
    doc.completed = !doc.completed;
    await doc.save();
    logger.info(`Toggled ${id}`);
    return toTodo(doc);
}

export async function remove(id: string): Promise<boolean> {
    if (!validId(id)) return false;
    const { deletedCount } = await TodoModel.deleteOne({ _id: id });
    if (deletedCount === 0) return false;
    logger.info(`Deleted ${id}`);
    return true;
}

/* 1030 — full restore: replace the whole collection from a JSON backup. */
export async function importTodos(items: ImportItem[]): Promise<number> {
    await TodoModel.deleteMany({});
    if (items.length) {
        /* createdAt/updatedAt are always explicit (falling back to now) so
           backup values are preserved; timestamps are disabled so they are
           not overwritten. */
        await TodoModel.insertMany(
            items.map((item) => {
                const now = new Date();
                return {
                    name: item.name,
                    completed: item.completed,
                    priority: item.priority,
                    due: item.due ?? null,
                    createdAt: item.createdAt ?? now,
                    updatedAt: item.updatedAt ?? now,
                };
            }),
            { timestamps: false },
        );
    }
    return items.length;
}
