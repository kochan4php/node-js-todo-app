import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { connectDb } from '../../src/db/connect.ts';

export type StopFn = () => Promise<void>;

/* Satu memory-server per proses tes (node --test menjalankan tiap file di
   proses terpisah), jalur koneksi produksi (connectDb) ikut diuji. */
export async function connectTestDb(): Promise<StopFn> {
    const mongod = await MongoMemoryServer.create();
    await connectDb(mongod.getUri('rencana-test'));
    return async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
        await mongod.stop();
    };
}
