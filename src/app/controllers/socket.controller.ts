/**
 * @description This file contain a function for handle websocket / socket.io events
 * @description It will handle all websocket / socket.io events from client side
 * @author {Deo Sbrn}
 */

import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { logger } from '../../logger';

/**
 * @description Handle socket connection
 * @param {Socket<DefaultEventsMap>} socket - Socket object
 * @param {Server<DefaultEventsMap>} io - Socket.io object
 * @returns {void} - Void
 */
export default function SocketController(socket: Socket<DefaultEventsMap>, io: Server<DefaultEventsMap>): void {
    logger.info('Client', `connected: ${socket.id}`);

    socket.on('disconnect', () => {
        logger.info('Client', `disconnected: ${socket.id}`);
    });
}
