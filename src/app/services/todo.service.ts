import mongoose from 'mongoose';
import { MAX_TODOS } from '../../config/app.ts';
import type { Priority, Recurrence, Subtask, Todo } from '../../interfaces/todo.ts';
import { logger } from '../../logger/index.ts';
import { advanceDue } from '../helpers/date.ts';
import { sanitizeName } from '../helpers/validate.ts';
import { TodoModel, toTodo } from '../models/todo.model.ts';

export const MAX_SUBTASKS = 20; /* 1090 — embedded checklist cap for one plan */

export type ToggleResult = { todo: Todo; next: Todo | null };

type CreatedTodo = {
    name: string;
    priority?: Priority;
    due?: string | null;
    category?: string | null;
    notes?: string | null;
    archived?: boolean;
    repeat?: Recurrence | null;
    subtasks?: Subtask[];
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
    repeat?: Recurrence | null;
    subtasks?: Subtask[];
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
    repeat?: Recurrence | null;
    subtasks?: Subtask[];
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
    repeat?: Recurrence | null,
): Promise<Todo | null> {
    return insertOne({
        name,
        completed: false,
        priority,
        due: due ?? null,
        category: category ?? null,
        notes: notes ?? null,
        repeat: repeat ?? null,
        subtasks: [],
    });
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
        repeat: saved.repeat ?? null,
        subtasks: saved.subtasks ?? [],
    });
}

export async function update(
    id: string,
    name: string,
    priority?: Priority,
    due?: string | null,
    category?: string | null,
    notes?: string | null,
    repeat?: Recurrence | null,
): Promise<Todo | null> {
    if (!validId(id)) return null;
    const doc = await TodoModel.findById(id);
    if (!doc) return null;
    doc.name = name;
    doc.priority = priority;
    doc.due = due ?? null;
    doc.category = category ?? null;
    doc.notes = notes ?? null;
    doc.repeat = repeat ?? null;
    await doc.save();
    logger.info(`Updated ${id}`);
    return toTodo(doc);
}

export async function toggle(id: string): Promise<ToggleResult | null> {
    if (!validId(id)) return null;
    const doc = await TodoModel.findById(id);
    if (!doc) return null;
    const wasCompleted = doc.completed;
    doc.completed = !wasCompleted;
    /* 1040 — P0: when completion flips on/off the timestamp follows it. */
    doc.completedAt = doc.completed ? new Date() : null;

    /* 1080 — P2 ("lagi-lagi"): completing a recurring plan spawns the next
       occurrence. The current one stays done for the streak/ledger; the copy
       inherits everything but advances the due date and resets the checklist.
       The MAX_TODOS guard inside insertOne silently skips the spawn. */
    let next: Todo | null = null;
    if (doc.completed && !wasCompleted && doc.repeat && !doc.archived) {
        next = await insertOne({
            name: doc.name,
            completed: false,
            priority: doc.priority ?? undefined,
            due: advanceDue(doc.due ?? null, doc.repeat),
            category: doc.category ?? null,
            notes: doc.notes ?? null,
            repeat: doc.repeat,
            subtasks: (doc.subtasks ?? []).map((sub) => ({ text: sub.text, done: false })),
        });
    }

    await doc.save();
    logger.info(`Toggled ${id}`);
    return { todo: toTodo(doc), next };
}

/* 1090 — P2: one endpoint mutates the embedded checklist (add/toggle/remove).
   The removed row needs an exact integer index into the current list. */
export async function updateSubtask(id: string, action: 'add' | 'toggle' | 'remove', index?: number, text?: string): Promise<Todo | null> {
    if (!validId(id)) return null;
    const doc = await TodoModel.findById(id);
    if (!doc) return null;
    const subtasks = (doc.subtasks ?? []).map((sub) => ({ text: sub.text, done: sub.done }));

    if (action === 'add') {
        const clean = sanitizeName(text ?? '');
        if (!clean || subtasks.length >= MAX_SUBTASKS) return null;
        subtasks.push({ text: clean, done: false });
    } else {
        if (typeof index !== 'number' || !Number.isInteger(index) || index < 0 || index >= subtasks.length) return null;
        if (action === 'toggle') subtasks[index].done = !subtasks[index].done;
        else subtasks.splice(index, 1);
    }

    const updated = await TodoModel.findByIdAndUpdate(id, { $set: { subtasks } }, { new: true });
    if (!updated) return null;
    logger.info(`Subtask ${action} → ${id}`);
    return toTodo(updated);
}

/* 1100 — P2: bulk actions. Idempotent sets (not toggles): "Selesaikan" always
   completes, "Arsipkan" always archives. Completed recurring plans do NOT
   spawn a next occurrence here (bulk is for cleanup).
   ponytail: complete re-stamps completedAt on already-done rows — fine while
   `$set` stays the laziest correct op; switch to a $cond if streak fidelity matters. */
export async function bulk(ids: string[], action: 'complete' | 'archive' | 'delete'): Promise<number> {
    const valid = ids.filter((id) => typeof id === 'string' && validId(id));
    if (!valid.length) return 0;
    if (action === 'delete') {
        const { deletedCount } = await TodoModel.deleteMany({ _id: { $in: valid } });
        return deletedCount ?? 0;
    }
    const patch = action === 'complete' ? { completed: true, completedAt: new Date() } : { archived: true };
    const { modifiedCount } = await TodoModel.updateMany({ _id: { $in: valid } }, { $set: patch });
    return modifiedCount ?? 0;
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
                    repeat: item.repeat ?? null,
                    subtasks: item.subtasks ?? [],
                    createdAt: item.createdAt ?? now,
                    updatedAt: item.updatedAt ?? now,
                };
            }),
            { timestamps: false },
        );
    }
    return items.length;
}
