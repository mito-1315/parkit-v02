import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { socketManager } from '../sockets/socketManager';

export const ProtectedRoute: React.FC = () => {
  const { token, activeFacilityId } = useAuthStore();

  // Connect sockets globally once authenticated
  useEffect(() => {
    if (!token) return;
    socketManager.connect(token, activeFacilityId);
    return () => socketManager.disconnect();
  }, [token, activeFacilityId]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
