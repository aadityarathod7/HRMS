const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');

let wss;
// Map userId -> Set of WebSocket connections (a user can have multiple tabs)
const userClients = new Map();

const initSocket = (server) => {
  wss = new WebSocketServer({ server, path: '/leaveNotification' });

  wss.on('connection', (ws, req) => {
    // Extract token from query param: ws://localhost:5000/leaveNotification?token=xxx
    let userId = null;
    let userRoles = [];
    try {
      const params = new URL(req.url, 'http://localhost').searchParams;
      const token = params.get('token');
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
        userRoles = decoded.roles || [];
        ws.userId = userId;
        ws.userRoles = userRoles;
      }
    } catch (e) {}

    // Register client
    if (userId) {
      if (!userClients.has(userId)) userClients.set(userId, new Set());
      userClients.get(userId).add(ws);
    }

    // Also keep track for broadcast-all
    ws.isAlive = true;

    ws.on('close', () => {
      if (userId && userClients.has(userId)) {
        userClients.get(userId).delete(ws);
        if (userClients.get(userId).size === 0) userClients.delete(userId);
      }
    });
  });

  return wss;
};

// Send to specific user
const sendToUser = (userId, message) => {
  const data = typeof message === 'string' ? message : JSON.stringify(message);
  const sockets = userClients.get(userId.toString());
  if (sockets) {
    sockets.forEach(ws => { if (ws.readyState === 1) ws.send(data); });
  }
};

// Send to all users with specific roles (HR, ADMIN, MANAGER)
const sendToRoles = (roles, message) => {
  const data = typeof message === 'string' ? message : JSON.stringify(message);
  wss?.clients?.forEach(ws => {
    if (ws.readyState === 1 && ws.userRoles) {
      if (ws.userRoles.some(r => roles.includes(r))) {
        ws.send(data);
      }
    }
  });
};

// Send to specific users + roles (e.g. reporting manager + all HR/Admin)
const notifyLeaveAction = (message, targetUserId, reportingManagerId) => {
  const data = typeof message === 'string' ? message : JSON.stringify(message);
  const sentTo = new Set();

  // Send to HR and ADMIN
  wss?.clients?.forEach(ws => {
    if (ws.readyState === 1 && ws.userId && ws.userRoles) {
      if (ws.userRoles.some(r => ['HR', 'ADMIN'].includes(r))) {
        ws.send(data);
        sentTo.add(ws.userId);
      }
    }
  });

  // Send to reporting manager (if not already sent)
  if (reportingManagerId && !sentTo.has(reportingManagerId.toString())) {
    sendToUser(reportingManagerId, message);
    sentTo.add(reportingManagerId.toString());
  }

  // Send to the employee who owns the leave (if not already sent) — for approve/reject notifications
  if (targetUserId && !sentTo.has(targetUserId.toString())) {
    sendToUser(targetUserId, message);
  }
};

// Broadcast to all (fallback)
const broadcast = (message) => {
  const data = typeof message === 'string' ? message : JSON.stringify(message);
  wss?.clients?.forEach(ws => { if (ws.readyState === 1) ws.send(data); });
};

module.exports = { initSocket, broadcast, sendToUser, sendToRoles, notifyLeaveAction };
