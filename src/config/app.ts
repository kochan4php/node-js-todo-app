import { resolve } from 'node:path';

export const PORT = Number(process.env.PORT) || 3000;
export const DATA_FILE = process.env.DATA_PATH || resolve(import.meta.dirname, '../../data/todos.json');
