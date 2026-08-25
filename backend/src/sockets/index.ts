import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { setupDashboardNamespace } from './dashboardNamespace';
import { setupAlertNamespace } from './alertNamespace';

export interface SocketWithUser extends Socket {
  user?: any;
}

let io: Server;

export const socketAuthMiddleware = (socket: SocketWithUser, next: (err?: Error) => void) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }
  try {
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
};

export const initSockets = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: config.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    },
  });

  setupDashboardNamespace(io);
  setupAlertNamespace(io);

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
