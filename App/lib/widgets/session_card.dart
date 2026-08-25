import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/parking_session.dart';
import '../theme.dart';

class SessionCard extends StatelessWidget {
  final ParkingSession session;
  final VoidCallback? onTap;

  const SessionCard({super.key, required this.session, this.onTap});

  Color _statusColor(SessionStatus s) {
    switch (s) {
      case SessionStatus.active:
        return Pk.successLt;
      case SessionStatus.reserved:
        return Pk.primaryLt;
      case SessionStatus.detecting:
        return Pk.warning;
      case SessionStatus.completed:
        return Pk.textSecondary;
      case SessionStatus.cancelled:
        return Pk.dangerLt;
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
          color: Pk.surface,
          borderRadius: Pk.r8,
          border: Border.all(color: Pk.border),
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
                      color: Pk.textPrimary,
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.local_parking_rounded,
                          color: Pk.primary, size: 14),
                      const SizedBox(width: 4),
                      Text(
                        slotLabel,
                        style: const TextStyle(
                          color: Pk.textSecondary,
                          fontSize: 13,
                        ),
                      ),
                      if (zoneName.isNotEmpty) ...[
                        const SizedBox(width: 8),
                        const Icon(Icons.grid_view_rounded,
                            color: Pk.textMuted, size: 12),
                        const SizedBox(width: 4),
                        Text(
                          zoneName,
                          style: const TextStyle(
                            color: Pk.textMuted,
                            fontSize: 12,
                          ),
                        ),
                      ],
                      if (floor != null) ...[
                        const SizedBox(width: 8),
                        Text(
                          'Floor $floor',
                          style: const TextStyle(
                            color: Pk.textMuted,
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
                        color: Pk.textMuted,
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
                        color: Pk.textMuted,
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
<<<<<<< HEAD
                color: _statusColor(session.status).withAlpha((0.12 * 255).round()),
                borderRadius: Pk.r4,
                border: Border.all(
                    color: _statusColor(session.status).withAlpha((0.3 * 255).round())),
=======
                color: _statusColor(session.status).withOpacity(0.12),
                borderRadius: Pk.r4,
                border: Border.all(
                    color: _statusColor(session.status).withOpacity(0.3)),
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
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
