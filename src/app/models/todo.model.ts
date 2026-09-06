import type mongoose from 'mongoose';
import { model, Schema } from 'mongoose';
import type { Priority, Todo } from '../../interfaces/todo.ts';

const PRIORITIES: readonly Priority[] = ['low', 'medium', 'high'];

/* Skema tunggal (ODM) — semua akses data lewat model ini, tidak ada lagi
   file JSON lokal. `timestamps` mengelola createdAt/updatedAt. */
const todoSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 200 },
        completed: { type: Boolean, default: false },
        priority: { type: String, enum: [...PRIORITIES] },
        due: { type: String, default: null },
    },
    { timestamps: true },
);

export const TodoModel = model('Todo', todoSchema);

type TodoDoc = {
    _id: mongoose.Types.ObjectId;
    name: string;
    completed: boolean;
    priority?: Priority | null;
    due?: string | null;
    createdAt: Date;
    updatedAt: Date;
};

/* Dokument Mongo (ObjectId/Dates) → bentuk Todo yang dipakai view & API. */
export function toTodo(doc: TodoDoc): Todo {
    return {
        id: doc._id.toString(),
        name: doc.name,
        completed: doc.completed,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        priority: doc.priority ?? undefined,
        due: doc.due ?? null,
    };
}
