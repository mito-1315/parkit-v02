import { Server } from 'socket.io';
import { socketAuthMiddleware, SocketWithUser } from './index';

export const setupAlertNamespace = (io: Server) => {
  const namespace = io.of('/alerts');

  namespace.use(socketAuthMiddleware);

  namespace.on('connection', (socket: SocketWithUser) => {
    socket.on('joinFacility', (facilityId: number) => {
      socket.join(`facility_${facilityId}`);
    });

    socket.on('leaveFacility', (facilityId: number) => {
      socket.leave(`facility_${facilityId}`);
    });
  });
};
