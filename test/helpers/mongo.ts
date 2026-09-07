import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { connectDb } from '../../src/db/connect.ts';

/* Auth reads env-backed config at module import — make the shared test env
   deterministic before any test file pulls in src/app.ts. */
process.env.NODE_ENV = 'production';
process.env.BETTER_AUTH_SECRET = 'test-secret-not-for-production';

export type StopFn = () => Promise<void>;

/* One memory-server per test process (node --test runs each file in its own
   process); the production connection path (connectDb) gets exercised too.
   Replica-set mode is required: Better Auth wraps user+session writes in
   transactions, which plain standalone MongoDB nodes do not support. */
export async function connectTestDb(): Promise<StopFn> {
    const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    await connectDb(replSet.getUri('planner-test'));
    return async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
        await replSet.stop();
    };
}
