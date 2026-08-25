import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../models/parking_session.dart';
import '../providers/session_provider.dart';
import '../theme.dart';

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
      backgroundColor: Pk.bg,
      appBar: AppBar(
        backgroundColor: Pk.bg,
        title: const Text('History'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(color: Pk.border, height: 1),
        ),
      ),
      body: historyAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: Pk.primary, strokeWidth: 2),
        ),
        error: (e, _) => Center(
          child: Text('Failed to load history\n$e',
              style: const TextStyle(color: Pk.dangerLt, fontSize: 13),
              textAlign: TextAlign.center),
        ),
        data: (sessions) => sessions.isEmpty
            ? const _EmptyHistory()
            : RefreshIndicator(
                color: Pk.primary,
                onRefresh: () => ref.refresh(sessionHistoryProvider.future),
                child: ListView.separated(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
                  itemCount: sessions.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 1),
                  itemBuilder: (_, i) => _HistoryRow(
                    session: sessions[i],
                    formatDuration: _formatDuration,
                  ),
                ),
              ),
      ),
    );
  }
}

class _EmptyHistory extends StatelessWidget {
  const _EmptyHistory();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.history_rounded, color: Pk.textMuted, size: 44),
          SizedBox(height: 14),
          Text('No history yet',
              style: TextStyle(
                  color: Pk.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.w700)),
          SizedBox(height: 6),
          Text('Completed sessions appear here',
              style: TextStyle(color: Pk.textSecondary, fontSize: 13)),
        ],
      ),
    );
  }
}

class _HistoryRow extends StatelessWidget {
  final ParkingSession session;
  final String Function(Duration) formatDuration;
  const _HistoryRow(
      {required this.session, required this.formatDuration});

  @override
  Widget build(BuildContext context) {
    final facilityName =
        session.facilityName ?? session.slot?.zone?.facility?.name ?? 'Facility';
    final slotLabel = session.slot?.label ?? '—';
    final date = session.entryTime != null
        ? DateFormat('dd MMM yyyy').format(session.entryTime!.toLocal())
        : '—';
    final time = session.entryTime != null
        ? DateFormat('HH:mm').format(session.entryTime!.toLocal())
        : '';

    return Container(
      key: ValueKey(session.id),
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Pk.border)),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
<<<<<<< HEAD
                  color: Pk.primary.withAlpha((0.1 * 255).round()),
=======
              color: Pk.primary.withOpacity(0.1),
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
              borderRadius: Pk.r6,
            ),
            child: const Icon(Icons.local_parking_rounded,
                color: Pk.primary, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(facilityName,
                    style: const TextStyle(
                        color: Pk.textPrimary,
                        fontWeight: FontWeight.w600,
                        fontSize: 14)),
                const SizedBox(height: 2),
                Text(
                  'Slot $slotLabel · $date $time',
                  style: const TextStyle(
                      color: Pk.textSecondary, fontSize: 12),
                ),
              ],
            ),
          ),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Pk.surface2,
              borderRadius: Pk.r4,
              border: Border.all(color: Pk.border),
            ),
            child: Text(
              formatDuration(session.duration),
              style: const TextStyle(
                  color: Pk.textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }
}
