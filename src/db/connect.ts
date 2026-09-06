import mongoose from 'mongoose';
import { logger } from '../logger/index.ts';

/* Production bootstrap: the app refuses to start if MongoDB is unreachable —
   data lives 100% in the DB, not in local files. */
export async function connectDb(uri: string): Promise<void> {
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        logger.info('MongoDB connected');
    } catch (error) {
        logger.error(`Could not connect to MongoDB: ${(error as Error).message}`);
        process.exit(1);
    }
}
