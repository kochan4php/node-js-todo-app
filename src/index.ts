/**
 * @description This file is the entry point of the application
 * @description It will bootstrap the application and start the server using IIFE (Immediately Invoked Function Expression)
 * @description It will also initialize socket.io and listen to connection event
 * @author {Deo Sbrn}
 */

import { Application } from 'express';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import init from './app';
import SocketController from './app/controllers/socket.controller';
import { socketConfig } from './config/app';
import { PORT } from './config/env';
import { logger } from './logger';

/**
 * Bootstrap the application
 */
(async function () {
    const app: Application = init();
    const server = app.listen(PORT, () => logger.info('Server', `started on port ${PORT}`));
    const io: Server<DefaultEventsMap> = new Server(server, socketConfig());
    io.on('connection', (socket: Socket<DefaultEventsMap>) => SocketController(socket, io));
})();
