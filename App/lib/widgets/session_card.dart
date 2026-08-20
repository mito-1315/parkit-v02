import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/parking_session.dart';

class SessionCard extends StatelessWidget {
  final ParkingSession session;
  final VoidCallback? onTap;

  const SessionCard({super.key, required this.session, this.onTap});

  Color _statusColor(SessionStatus s) {
    switch (s) {
      case SessionStatus.active:
        return const Color(0xFF4ADE80);
      case SessionStatus.reserved:
        return const Color(0xFF60A5FA);
      case SessionStatus.detecting:
        return const Color(0xFFFBBF24);
      case SessionStatus.completed:
        return const Color(0xFF94A3B8);
      case SessionStatus.cancelled:
        return const Color(0xFFF87171);
    }
  }

  String _formatDuration(Duration d) {
    final h = d.inHours;
    final m = d.inMinutes.remainder(60);
    if (h > 0) return '${h}h ${m}m';
    return '${m}m';
  }

  @override
  Widget build(BuildContext context) {
    final facilityName = session.facilityName ??
        session.slot?.zone?.facility?.name ??
        'Facility';
    final slotLabel = session.slot?.label ?? '—';
    final zoneName = session.slot?.zone?.name ?? '';
    final floor = session.slot?.floor;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 0, vertical: 6),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF1A1A2E),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.06)),
        ),
        child: Row(
          children: [
            // Status dot
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _statusColor(session.status),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    facilityName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.local_parking_rounded,
                          color: Color(0xFF6366F1), size: 14),
                      const SizedBox(width: 4),
                      Text(
                        slotLabel,
                        style: const TextStyle(
                          color: Color(0xFF94A3B8),
                          fontSize: 13,
                        ),
                      ),
                      if (zoneName.isNotEmpty) ...[
                        const SizedBox(width: 8),
                        const Icon(Icons.grid_view_rounded,
                            color: Color(0xFF64748B), size: 12),
                        const SizedBox(width: 4),
                        Text(
                          zoneName,
                          style: const TextStyle(
                            color: Color(0xFF64748B),
                            fontSize: 12,
                          ),
                        ),
                      ],
                      if (floor != null) ...[
                        const SizedBox(width: 8),
                        Text(
                          'Floor $floor',
                          style: const TextStyle(
                            color: Color(0xFF64748B),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ],
                  ),
                  if (session.entryTime != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      DateFormat('dd MMM yyyy · HH:mm')
                          .format(session.entryTime!.toLocal()),
                      style: const TextStyle(
                        color: Color(0xFF64748B),
                        fontSize: 12,
                      ),
                    ),
                  ],
                  if (session.status == SessionStatus.completed &&
                      session.exitTime != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      'Duration: ${_formatDuration(session.duration)}',
                      style: const TextStyle(
                        color: Color(0xFF64748B),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: _statusColor(session.status).withOpacity(0.12),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                session.status.label,
                style: TextStyle(
                  color: _statusColor(session.status),
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
