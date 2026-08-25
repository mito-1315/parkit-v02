<<<<<<< HEAD
import React, { useEffect } from 'react';
=======
import React from 'react';
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { socketManager } from '../sockets/socketManager';

export const ProtectedRoute: React.FC = () => {
  const { token, activeFacilityId } = useAuthStore();

<<<<<<< HEAD
  // Connect sockets globally once authenticated
  useEffect(() => {
    if (!token) return;
    socketManager.connect(token, activeFacilityId);
    return () => socketManager.disconnect();
  }, [token, activeFacilityId]);

=======
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
  if (!token) {
    return <Navigate to="/" replace />;
  }

<<<<<<< HEAD
=======
  // Connect sockets globally once authenticated
  React.useEffect(() => {
    socketManager.connect(token, activeFacilityId);
    return () => socketManager.disconnect();
  }, [token, activeFacilityId]);

>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
  return <Outlet />;
};
