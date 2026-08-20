import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketManager } from '../sockets/socketManager';

export const useSlotStatusEvents = (facilityId: number | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = socketManager.getDashboardSocket();
    if (!socket || !facilityId) return;

    const handleSlotUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      queryClient.invalidateQueries({ queryKey: ['facilities', facilityId, 'slots'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    };

    socket.on('slot:statusChanged', handleSlotUpdate);
    socket.on('session:updated', handleSlotUpdate);
    socket.on('slotUpdate', handleSlotUpdate);
    socket.on('slot_update', handleSlotUpdate);

    return () => {
      socket.off('slot:statusChanged', handleSlotUpdate);
      socket.off('session:updated', handleSlotUpdate);
      socket.off('slotUpdate', handleSlotUpdate);
      socket.off('slot_update', handleSlotUpdate);
    };
  }, [facilityId, queryClient]);
};

export const useAlertEvents = (facilityId: number | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = socketManager.getAlertsSocket();
    if (!socket || !facilityId) return;

    const handleNewAlert = () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    };

    socket.on('alert:new', handleNewAlert);
    socket.on('alert:resolved', handleNewAlert);
    socket.on('newAlert', handleNewAlert);
    socket.on('new_alert', handleNewAlert);

    return () => {
      socket.off('alert:new', handleNewAlert);
      socket.off('alert:resolved', handleNewAlert);
      socket.off('newAlert', handleNewAlert);
      socket.off('new_alert', handleNewAlert);
    };
  }, [facilityId, queryClient]);
};
