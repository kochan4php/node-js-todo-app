import mongoose from 'mongoose';
import { logger } from '../logger/index.ts';

/* Bootstrap produksi: tanpa MongoDB tersambung aplikasi tidak mulai —
   data 100% di DB, bukan file lokal. */
export async function connectDb(uri: string): Promise<void> {
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        logger.info('MongoDB terhubung');
    } catch (error) {
        logger.error(`Tidak dapat terhubung ke MongoDB: ${(error as Error).message}`);
        process.exit(1);
    }
}
