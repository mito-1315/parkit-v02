import { prisma } from '../database/prismaClient';
import { getIo } from '../sockets';

export class AlertService {
  static async raiseAlert(data: {
    facility_id: number;
    alert_type: string;
    severity: string;
    related_camera_id?: number;
    related_slot_id?: number;
    related_gate_id?: number;
    related_session_id?: number;
    message: string;
  }) {
    // Check if unresolved alert of same type exists
    // Scope to specific entity if provided, to allow multiple distinct alerts (e.g. 2 different cameras offline)
    const existing = await prisma.alert.findFirst({
      where: {
        facility_id: data.facility_id,
        alert_type: data.alert_type as any,
        is_resolved: false,
        ...(data.related_camera_id ? { related_camera_id: data.related_camera_id } : {}),
        ...(data.related_slot_id ? { related_slot_id: data.related_slot_id } : {}),
      }
    });

    if (existing) {
      return existing; // Idempotent
    }

    const newAlert = await prisma.alert.create({
      data: {
        facility_id: data.facility_id,
        alert_type: data.alert_type as any,
        severity: data.severity as any,
        related_camera_id: data.related_camera_id,
        related_slot_id: data.related_slot_id,
        related_gate_id: data.related_gate_id,
        related_session_id: data.related_session_id,
        message: data.message
      }
    });

    try {
      const io = getIo();
      io.of('/alerts').to(`facility_${data.facility_id}`).emit('alert:new', newAlert);
    } catch (e) {
      // ignore if socket is not fully initialized yet
    }

    return newAlert;
  }

  static async resolveAlert(alertId: number, adminId?: number) {
    const alert = await prisma.alert.update({
      where: { alert_id: alertId },
      data: {
        is_resolved: true,
        resolved_at: new Date(),
        ...(adminId ? { resolved_by: adminId } : {})
      }
    });

    try {
      const io = getIo();
      io.of('/alerts').to(`facility_${alert.facility_id}`).emit('alert:resolved', alert);
    } catch (e) {}

    return alert;
  }

  static async getAlerts(filters: any) {
    return prisma.alert.findMany({
      where: filters,
      orderBy: { created_at: 'desc' }
    });
  }
}
