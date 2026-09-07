export type Priority = 'low' | 'medium' | 'high';

export type Recurrence = 'daily' | 'weekly' | 'monthly';

export interface Subtask {
    text: string;
    done: boolean;
}

export interface Todo {
    id: string;
    name: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
    priority?: Priority;
    due?: string | null;
    category?: string | null;
    completedAt?: string | null;
    sortOrder: number;
    notes?: string | null;
    archived: boolean;
    repeat?: Recurrence | null;
    subtasks: Subtask[];
}
