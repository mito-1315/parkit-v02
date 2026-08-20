import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { socketManager } from '../sockets/socketManager';

export const ProtectedRoute: React.FC = () => {
  const { token, activeFacilityId } = useAuthStore();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Connect sockets globally once authenticated
  React.useEffect(() => {
    socketManager.connect(token, activeFacilityId);
    return () => socketManager.disconnect();
  }, [token, activeFacilityId]);

  return <Outlet />;
};
