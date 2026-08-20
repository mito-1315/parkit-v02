import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../models/parking_session.dart';
import '../providers/session_provider.dart';

class HistoryScreen extends ConsumerWidget {
  const HistoryScreen({super.key});

  String _formatDuration(Duration d) {
    final h = d.inHours;
    final m = d.inMinutes.remainder(60);
    if (h > 0) return '${h}h ${m}m';
    return '${m}m';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historyAsync = ref.watch(sessionHistoryProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0A0F),
        title: ShaderMask(
          shaderCallback: (b) => const LinearGradient(
            colors: [Color(0xFF60A5FA), Color(0xFFA78BFA)],
          ).createShader(b),
          child: const Text(
            'Parking History',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w800,
              fontSize: 20,
            ),
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: Color(0xFF94A3B8)),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        elevation: 0,
      ),
      body: historyAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: Color(0xFF6366F1)),
        ),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              'Failed to load history\n$e',
              style: const TextStyle(color: Color(0xFFF87171)),
              textAlign: TextAlign.center,
            ),
          ),
        ),
        data: (sessions) => sessions.isEmpty
            ? _EmptyHistory()
            : RefreshIndicator(
                color: const Color(0xFF6366F1),
                onRefresh: () => ref.refresh(sessionHistoryProvider.future),
                child: ListView.builder(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                  itemCount: sessions.length,
                  itemBuilder: (_, i) =>
                      _HistoryCard(session: sessions[i], formatDuration: _formatDuration),
                ),
              ),
      ),
    );
  }
}

class _EmptyHistory extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: const Color(0xFF6366F1).withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.history_rounded,
                color: Color(0xFF6366F1), size: 36),
          ),
          const SizedBox(height: 16),
          const Text(
            'No history yet',
            style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 6),
          const Text(
            'Completed parking sessions will appear here',
            style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
          ),
        ],
      ),
    );
  }
}

class _HistoryCard extends StatelessWidget {
  final ParkingSession session;
  final String Function(Duration) formatDuration;

  const _HistoryCard({
    required this.session,
    required this.formatDuration,
  });

  @override
  Widget build(BuildContext context) {
    final facilityName = session.facilityName ??
        session.slot?.zone?.facility?.name ??
        'Facility';
    final slotLabel = session.slot?.label ?? '—';
    final zoneName = session.slot?.zone?.name ?? '';
    final date = session.entryTime != null
        ? DateFormat('dd MMM yyyy').format(session.entryTime!.toLocal())
        : '—';
    final time = session.entryTime != null
        ? DateFormat('HH:mm').format(session.entryTime!.toLocal())
        : '';

    return Container(
      key: ValueKey(session.id),
      margin: const EdgeInsets.symmetric(vertical: 6),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A2E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Left: icon
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFF6366F1).withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.local_parking_rounded,
                color: Color(0xFF6366F1), size: 22),
          ),
          const SizedBox(width: 14),
          // Center: info
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
                    Text(
                      'Slot $slotLabel',
                      style: const TextStyle(
                          color: Color(0xFF94A3B8), fontSize: 13),
                    ),
                    if (zoneName.isNotEmpty) ...[
                      const Text(
                        ' · ',
                        style: TextStyle(color: Color(0xFF475569)),
                      ),
                      Text(
                        zoneName,
                        style: const TextStyle(
                            color: Color(0xFF64748B), fontSize: 12),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  '$date · $time',
                  style: const TextStyle(
                      color: Color(0xFF475569), fontSize: 12),
                ),
              ],
            ),
          ),
          // Right: duration
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: const Color(0xFF94A3B8).withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              formatDuration(session.duration),
              style: const TextStyle(
                color: Color(0xFF94A3B8),
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
