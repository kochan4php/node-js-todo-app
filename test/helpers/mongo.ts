import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { connectDb } from '../../src/db/connect.ts';

export type StopFn = () => Promise<void>;

/* One memory-server per test process (node --test runs each file in its own
   process); the production connection path (connectDb) gets exercised too. */
export async function connectTestDb(): Promise<StopFn> {
    const mongod = await MongoMemoryServer.create();
    await connectDb(mongod.getUri('todos-test'));
    return async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
        await mongod.stop();
    };
}
