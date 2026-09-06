import { createServer } from 'node:http';
import init from './app.ts';
import { PORT } from './config/app.ts';
import { logger } from './logger/index.ts';

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
        server.close(() => process.exit(0));
        setTimeout(() => process.exit(1), 5000).unref();
    });
}
