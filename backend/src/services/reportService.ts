import { prisma } from '../database/prismaClient';

export class ReportService {
  static async getDaily(facilityId?: number) {
    const where = facilityId ? { facility_id: facilityId } : {};
    const sessions = await prisma.parkingSession.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    const slots = await prisma.parkingSlot.findMany({
      where: facilityId ? { facility_id: facilityId } : {},
    });

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const occupancyByDay: Array<{
      date: string;
      entries: number;
      exits: number;
      occupancyPct: number;
    }> = [];

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now - i * dayMs);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + dayMs);
      const daySessions = sessions.filter((s) => {
        const t = (s.entry_time ?? s.allocated_at).getTime();
        return t >= dayStart.getTime() && t < dayEnd.getTime();
      });
      const entries = daySessions.filter((s) => s.entry_time).length;
      const exits = daySessions.filter((s) => s.exit_time).length;
      const occupiedThen = daySessions.filter((s) => s.status === 'ACTIVE' || s.status === 'COMPLETED').length;
      occupancyByDay.push({
        date: dayStart.toISOString().slice(0, 10),
        entries,
        exits,
        occupancyPct: slots.length ? Math.round((occupiedThen / slots.length) * 100) : 0,
      });
    }

    const completed = sessions.filter((s) => s.status === 'COMPLETED' && s.duration_minutes != null);
    const avgDurationMinutes = completed.length
      ? Math.round(completed.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) / completed.length)
      : 0;

    const occupied = slots.filter((s) => s.status === 'OCCUPIED' || s.status === 'RESERVED').length;
    const peakOccupancyPct = slots.length ? Math.round((occupied / slots.length) * 100) : 0;

    const hourAgo = new Date(now - 60 * 60 * 1000);
    const entriesLastHour = sessions.filter((s) => s.entry_time && s.entry_time >= hourAgo).length;
    const exitsLastHour = sessions.filter((s) => s.exit_time && s.exit_time >= hourAgo).length;

    return {
      totalEntries: sessions.filter((s) => s.entry_time).length,
      totalExits: sessions.filter((s) => s.exit_time).length,
      currentlyActive: sessions.filter((s) => s.status === 'ACTIVE').length,
      currentlyReserved: sessions.filter((s) => s.status === 'RESERVED').length,
      peakOccupancyPct,
      avgDurationMinutes,
      occupancyByDay,
      entriesLastHour,
      exitsLastHour,
      slotCounts: {
        total: slots.length,
        available: slots.filter((s) => s.status === 'AVAILABLE').length,
        occupied: slots.filter((s) => s.status === 'OCCUPIED').length,
        reserved: slots.filter((s) => s.status === 'RESERVED').length,
        unavailable: slots.filter((s) => !['AVAILABLE', 'OCCUPIED', 'RESERVED'].includes(s.status)).length,
      },
    };
  }
}
