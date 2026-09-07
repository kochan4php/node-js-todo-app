import mongoose from 'mongoose';
import { MAX_TODOS } from '../../config/app.ts';
import type { Priority, Todo } from '../../interfaces/todo.ts';
import { logger } from '../../logger/index.ts';
import { TodoModel, toTodo } from '../models/todo.model.ts';

type CreatedTodo = {
    name: string;
    priority?: Priority;
    due?: string | null;
    category?: string | null;
    notes?: string | null;
    archived?: boolean;
};

export type ImportItem = {
    name: string;
    completed: boolean;
    priority?: Priority;
    due?: string | null;
    category?: string | null;
    completedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    notes?: string | null;
    archived?: boolean;
};

function validId(id: string): boolean {
    return mongoose.isValidObjectId(id);
}

export async function getAll(): Promise<Todo[]> {
    const docs = await TodoModel.find().sort({ completed: 1, sortOrder: 1, createdAt: -1 }).lean();
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
    category?: string | null;
    completedAt?: Date | null;
    createdAt?: Date;
    notes?: string | null;
    archived?: boolean;
}): Promise<Todo | null> {
    const count = await TodoModel.countDocuments();
    if (count >= MAX_TODOS) return null;
    const doc = await TodoModel.create(item);
    logger.info(`Added ${item.name}`);
    return toTodo(doc);
}

export function create(
    name: string,
    priority?: Priority,
    due?: string | null,
    category?: string | null,
    notes?: string | null,
): Promise<Todo | null> {
    return insertOne({ name, completed: false, priority, due: due ?? null, category: category ?? null, notes: notes ?? null });
}

export function restore(saved: CreatedTodo & { completed: boolean; createdAt: string }): Promise<Todo | null> {
    const createdAt = saved.createdAt ? new Date(saved.createdAt) : undefined;
    const completedAt = saved.completed ? new Date() : null;
    return insertOne({
        name: saved.name,
        completed: saved.completed,
        createdAt,
        completedAt,
        priority: saved.priority,
        due: saved.due ?? null,
        category: saved.category ?? null,
        notes: saved.notes ?? null,
        archived: saved.archived ?? false,
    });
}

export async function update(
    id: string,
    name: string,
    priority?: Priority,
    due?: string | null,
    category?: string | null,
    notes?: string | null,
): Promise<Todo | null> {
    if (!validId(id)) return null;
    const doc = await TodoModel.findById(id);
    if (!doc) return null;
    doc.name = name;
    doc.priority = priority;
    doc.due = due ?? null;
    doc.category = category ?? null;
    doc.notes = notes ?? null;
    await doc.save();
    logger.info(`Updated ${id}`);
    return toTodo(doc);
}

export async function toggle(id: string): Promise<Todo | null> {
    if (!validId(id)) return null;
    const doc = await TodoModel.findById(id);
    if (!doc) return null;
    doc.completed = !doc.completed;
    /* 1040 — P0: when completion flips on/off the timestamp follows it. */
    doc.completedAt = doc.completed ? new Date() : null;
    await doc.save();
    logger.info(`Toggled ${id}`);
    return toTodo(doc);
}

/* Archive = set aside a plan (e.g. it became irrelevant) without deleting it.
   Archived plans vanish from the active list but stay in the data + export. */
export async function toggleArchived(id: string): Promise<Todo | null> {
    if (!validId(id)) return null;
    const doc = await TodoModel.findById(id);
    if (!doc) return null;
    doc.archived = !(doc.archived ?? false);
    await doc.save();
    logger.info(`Archived ${id}: ${doc.archived}`);
    return toTodo(doc);
}

/* 1040 — P0: manual order. Each id in the array gets sortOrder = its index. */
export async function reorderTodos(ids: string[]): Promise<number> {
    const valid = ids.filter((id) => typeof id === 'string' && validId(id));
    if (!valid.length) return 0;
    await TodoModel.bulkWrite(valid.map((id, index) => ({ updateOne: { filter: { _id: id }, update: { $set: { sortOrder: index } } } })));
    return valid.length;
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
                const completedAt = item.completedAt instanceof Date ? item.completedAt : item.completed ? now : null;
                return {
                    name: item.name,
                    completed: item.completed,
                    priority: item.priority,
                    due: item.due ?? null,
                    category: item.category ?? null,
                    completedAt,
                    notes: item.notes ?? null,
                    archived: item.archived ?? false,
                    createdAt: item.createdAt ?? now,
                    updatedAt: item.updatedAt ?? now,
                };
            }),
            { timestamps: false },
        );
    }
    return items.length;
}
