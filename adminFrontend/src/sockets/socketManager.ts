import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

class SocketManager {
  private dashboardSocket: Socket | null = null;
  private alertsSocket: Socket | null = null;

  connect(token: string, facilityId: number | null) {
    if (this.dashboardSocket || this.alertsSocket) {
      this.disconnect();
    }

    this.dashboardSocket = io(`${SOCKET_URL}/dashboard`, {
      auth: { token },
      transports: ['websocket'],
    });

    this.alertsSocket = io(`${SOCKET_URL}/alerts`, {
      auth: { token },
      transports: ['websocket'],
    });

    this.dashboardSocket.on('connect', () => {
      if (facilityId) {
        this.dashboardSocket?.emit('joinFacility', facilityId);
      }
    });

    this.alertsSocket.on('connect', () => {
      if (facilityId) {
        this.alertsSocket?.emit('joinFacility', facilityId);
      }
    });
  }

  disconnect() {
    if (this.dashboardSocket) {
      this.dashboardSocket.disconnect();
      this.dashboardSocket = null;
    }
    if (this.alertsSocket) {
      this.alertsSocket.disconnect();
      this.alertsSocket = null;
    }
  }

  getDashboardSocket() {
    return this.dashboardSocket;
  }

  getAlertsSocket() {
    return this.alertsSocket;
  }
}

export const socketManager = new SocketManager();
