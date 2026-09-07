import { createServer } from 'node:http';
import mongoose from 'mongoose';
import { MONGODB_URI, PORT } from './config/app.ts';
import { connectDb } from './db/connect.ts';
import { logger } from './logger/index.ts';

/* 100% MongoDB — without a connection the app never starts. */
/* Better Auth needs the live Mongoose client, so the app module (which
   builds the auth instance) loads only after the connection exists. */
await connectDb(MONGODB_URI);

const { default: init } = await import('./app.ts');
const app = init();
const server = createServer(app);

server.requestTimeout = 30_000; /* 621 — timeout reasonable per request */
server.headersTimeout = 31_000;

server.listen(PORT, () => {
    logger.info(`Server running at http://localhost:${PORT}`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, () => {
        logger.info(`Received ${signal}, shutting down...`);
        server.close(() => {
            void mongoose.disconnect().finally(() => process.exit(0));
        });
        setTimeout(() => process.exit(1), 5000).unref();
    });
}

/* 862 — unhandled promise/error: log and let the server keep running. */
process.on('unhandledRejection', (reason: unknown) => {
    logger.error(`Unhandled rejection: ${reason as string}`);
});
process.on('uncaughtException', (error: Error) => {
    logger.error(`Uncaught exception: ${error.stack ?? error.message}`);
});
