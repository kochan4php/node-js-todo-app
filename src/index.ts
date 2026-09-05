import { createServer } from 'node:http';
import init from './app.js';
import { PORT } from './config/app.js';
import { logger } from './logger/index.js';

const app = init();
const server = createServer(app);

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
