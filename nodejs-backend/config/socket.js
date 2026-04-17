const { WebSocketServer } = require('ws');

let wss;

const initSocket = (server) => {
  wss = new WebSocketServer({ server, path: '/leaveNotification' });

  wss.on('connection', (ws) => {
    ws.on('close', () => {});
  });

  return wss;
};

// Broadcast to all connected clients
const broadcast = (message) => {
  if (!wss) return;
  const data = typeof message === 'string' ? message : JSON.stringify(message);
  wss.clients.forEach(ws => {
    if (ws.readyState === 1) ws.send(data);
  });
};

// For leave actions - broadcast to all (simple & reliable)
const notifyLeaveAction = (message) => {
  broadcast(message);
};

module.exports = { initSocket, broadcast, notifyLeaveAction };
