import type mongoose from 'mongoose';
import { model, Schema } from 'mongoose';
import type { Priority, Recurrence, Subtask, Todo } from '../../interfaces/todo.ts';

const PRIORITIES: readonly Priority[] = ['low', 'medium', 'high'];
const RECURRENCES: readonly Recurrence[] = ['daily', 'weekly', 'monthly'];

/* Single ODM schema — all data access goes through this model, no more
   local JSON files. `timestamps` manages createdAt/updatedAt. */
const todoSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 200 },
        completed: { type: Boolean, default: false },
        priority: { type: String, enum: [...PRIORITIES] },
        due: { type: String, default: null },
        category: { type: String, trim: true, maxlength: 40, default: null, set: (value: unknown) => value || null },
        completedAt: { type: Date, default: null },
        sortOrder: { type: Number, default: 0 },
        notes: { type: String, trim: true, maxlength: 2000, default: null, set: (value: unknown) => value || null },
        archived: { type: Boolean, default: false },
        /* 1080 — P2: repeat ("lagi-lagi") — completing spawns the next occurrence. */
        repeat: { type: String, enum: [...RECURRENCES], default: null, set: (value: unknown) => value || null },
        /* 1090 — P2: subtasks — an embedded flat checklist (max 20 steps). */
        subtasks: {
            type: [
                {
                    _id: false,
                    text: { type: String, trim: true, maxlength: 200, required: true },
                    done: { type: Boolean, default: false },
                },
            ],
            default: [],
        },
    },
    { timestamps: true },
);

export const TodoModel = model('Todo', todoSchema, 'plans');

type TodoDoc = {
    _id: mongoose.Types.ObjectId;
    name: string;
    completed: boolean;
    priority?: Priority | null;
    due?: string | null;
    category?: string | null;
    completedAt?: Date | null;
    sortOrder?: number;
    notes?: string | null;
    archived?: boolean;
    repeat?: Recurrence | null;
    subtasks?: Subtask[];
    createdAt: Date;
    updatedAt: Date;
};

/* Mongo document (ObjectId/Dates) → the Todo shape used by views & API. */
export function toTodo(doc: TodoDoc): Todo {
    return {
        id: doc._id.toString(),
        name: doc.name,
        completed: doc.completed,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        priority: doc.priority ?? undefined,
        due: doc.due ?? null,
        category: doc.category ?? null,
        completedAt: doc.completedAt ? doc.completedAt.toISOString() : null,
        sortOrder: doc.sortOrder ?? 0,
        notes: doc.notes ?? null,
        archived: doc.archived ?? false,
        repeat: doc.repeat ?? null,
        subtasks: (doc.subtasks ?? []).map((sub) => ({ text: sub.text, done: sub.done })),
    };
}
