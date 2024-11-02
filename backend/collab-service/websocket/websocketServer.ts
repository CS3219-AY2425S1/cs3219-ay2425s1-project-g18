import WebSocket from 'ws';
import http from 'http';
import logger from '../utils/logger';

const setupWSConnection = require('./utils.cjs').setupWSConnection
export const setupCodeCollabWebSocketServer = (): void => {
  const wss = new WebSocket.Server({ noServer: true })
  const port = '5004'

  const server = http.createServer((_request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' })
    response.end('okay')
  })
  
  wss.on('connection', setupWSConnection)
  
  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, /** @param {any} ws */ ws => {
      wss.emit('connection', ws, request)
    })
  })
  
  server.listen(port, () => {
    logger.info(`WebSocket server is set up and running on port ${port}`)
  })

};
