/**
 * @description This file contain database configuration using mongoose
 * @author {Deo Sbrn}
 */

import mongoose from 'mongoose';
import { MONGO_URI } from './env';
import { logger } from '../logger';

/**
 * @description Connect to MongoDB Database
 * @returns {Promise<void>} - Promise object of void
 */
export default async function database(): Promise<void> {
    const connect = async () => {
        try {
            const conn = await mongoose.connect(MONGO_URI);
            const message = `MongoDB Connected: ${conn.connection.host}:${conn.connection.port}`;
            logger.info('Database', message);
        } catch (error: any) {
            logger.error('Database', error.message);
            return process.exit(1);
        }
    };

    await connect();

    mongoose.connection.on('disconnected', connect);
}
