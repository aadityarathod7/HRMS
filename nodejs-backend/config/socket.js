const { WebSocketServer } = require('ws');

let wss;

const initSocket = (server) => {
  wss = new WebSocketServer({ server, path: '/leaveNotification' });

  wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });
    ws.on('close', () => { ws.isAlive = false; });
  });

  // Heartbeat — terminate stale connections every 30s to prevent memory leak
  const heartbeat = setInterval(() => {
    wss.clients.forEach(ws => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

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
