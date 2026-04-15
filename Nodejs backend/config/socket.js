const { WebSocketServer } = require('ws');
const url = require('url');

let wss;
const clients = new Set();

const initSocket = (server) => {
  wss = new WebSocketServer({ server, path: '/leaveNotification' });

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('WebSocket client connected');

    ws.on('message', (message) => {
      // Broadcast to all connected clients
      const msg = message.toString();
      clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(msg);
        }
      });
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log('WebSocket client disconnected');
    });
  });

  return wss;
};

const broadcast = (message) => {
  const data = typeof message === 'string' ? message : JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(data);
    }
  });
};

module.exports = { initSocket, broadcast };
