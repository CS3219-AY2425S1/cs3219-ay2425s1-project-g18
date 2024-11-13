import WebSocket from 'ws';
import http from 'http';
import logger from '../utils/logger';

const setupWSConnection = require('./utils.cjs').setupWSConnection;

export const setupCodeCollabWebSocketServer = (server: http.Server): void => {
    const wss = new WebSocket.Server({ noServer: true });

    wss.on('connection', setupWSConnection);

    server.on('upgrade', (request, socket, head) => {
        const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);

        if (pathname.startsWith('/code-collab/')) {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        }
    });

    logger.info(`Code Collaboration WebSocket server is set up on /code-collab`);
};
