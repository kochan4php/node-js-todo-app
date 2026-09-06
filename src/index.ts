import { createServer } from 'node:http';
import mongoose from 'mongoose';
import init from './app.ts';
import { MONGODB_URI, PORT } from './config/app.ts';
import { connectDb } from './db/connect.ts';
import { logger } from './logger/index.ts';

/* 100% MongoDB — tanpa koneksi, aplikasi tidak pernah mulai. */
await connectDb(MONGODB_URI);

const app = init();
const server = createServer(app);

server.requestTimeout = 30_000; /* 621 — timeout reasonable per request */
server.headersTimeout = 31_000;

server.listen(PORT, () => {
    logger.info(`Server berjalan di http://localhost:${PORT}`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, () => {
        logger.info(`Menerima sinyal ${signal}, menutup server...`);
        server.close(() => {
            void mongoose.disconnect().finally(() => process.exit(0));
        });
        setTimeout(() => process.exit(1), 5000).unref();
    });
}

/* 862 — promise/error tak tertangani: log, biarkan server berjalan. */
process.on('unhandledRejection', (reason: unknown) => {
    logger.error(`Unhandled rejection: ${reason as string}`);
});
process.on('uncaughtException', (error: Error) => {
    logger.error(`Uncaught exception: ${error.stack ?? error.message}`);
});
