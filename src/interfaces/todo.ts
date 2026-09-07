export type Priority = 'low' | 'medium' | 'high';

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
}
