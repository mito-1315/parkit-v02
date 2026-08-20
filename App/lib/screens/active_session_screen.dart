import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../models/parking_session.dart';
import '../providers/session_provider.dart';
import '../widgets/gradient_button.dart';

class ActiveSessionScreen extends ConsumerStatefulWidget {
  const ActiveSessionScreen({super.key});

  @override
  ConsumerState<ActiveSessionScreen> createState() =>
      _ActiveSessionScreenState();
}

class _ActiveSessionScreenState extends ConsumerState<ActiveSessionScreen> {
  Timer? _ticker;
  Duration _elapsed = Duration.zero;
  bool _exiting = false;

  @override
  void initState() {
    super.initState();
    _startTicker();
  }

  void _startTicker() {
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      final session = ref.read(activeSessionProvider).value;
      if (session != null && session.entryTime != null) {
        setState(() {
          _elapsed = DateTime.now().difference(session.entryTime!);
        });
      }
    });
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  String _formatElapsed(Duration d) {
    final h = d.inHours.toString().padLeft(2, '0');
    final m = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$h:$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    final sessionAsync = ref.watch(activeSessionProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0A0F),
        title: const Text(
          'Active Session',
          style: TextStyle(
              color: Colors.white, fontWeight: FontWeight.w700, fontSize: 18),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: Color(0xFF94A3B8)),
          onPressed: () => context.pop(),
        ),
        elevation: 0,
      ),
      body: sessionAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: Color(0xFF6366F1)),
        ),
        error: (e, _) => Center(
          child: Text(e.toString(),
              style: const TextStyle(color: Color(0xFFF87171))),
        ),
        data: (session) {
          if (session == null ||
              session.status == SessionStatus.completed) {
            return const Center(
              child: Text(
                'No active session',
                style: TextStyle(color: Color(0xFF94A3B8)),
              ),
            );
          }

          final slot = session.slot;
          final vehicle = session.vehicle;
          final facilityName = session.facilityName ??
              slot?.zone?.facility?.name ??
              'Parking Facility';

          // Sync elapsed from entryTime if timer not yet populated.
          if (_elapsed == Duration.zero && session.entryTime != null) {
            _elapsed = DateTime.now().difference(session.entryTime!);
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ─── Elapsed time ──────────────────────────────────
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 28),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF1E3A2F), Color(0xFF0F2A1E)],
                    ),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                        color: const Color(0xFF4ADE80).withOpacity(0.2)),
                  ),
                  child: Column(
                    children: [
                      const Text(
                        'Time Parked',
                        style: TextStyle(
                            color: Color(0xFF4ADE80), fontSize: 13),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _formatElapsed(_elapsed),
                        key: const Key('elapsed_timer'),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 44,
                          fontWeight: FontWeight.w900,
                          fontFamily: 'monospace',
                          letterSpacing: 2,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // ─── Session info ──────────────────────────────────
                _InfoCard(
                  children: [
                    _Row(label: 'Facility', value: facilityName),
                    _Row(
                        label: 'Slot',
                        value: slot?.label ?? '—',
                        accent: true),
                    if (slot?.zone?.name != null)
                      _Row(label: 'Zone', value: slot!.zone!.name),
                    if (slot?.floor != null)
                      _Row(label: 'Floor', value: slot!.floor.toString()),
                  ],
                ),
                const SizedBox(height: 16),

                if (vehicle != null)
                  _InfoCard(
                    children: [
                      _Row(
                          label: 'Vehicle', value: vehicle.licensePlate),
                      if (vehicle.make != null || vehicle.model != null)
                        _Row(
                          label: 'Description',
                          value: [
                            if (vehicle.make != null) vehicle.make!,
                            if (vehicle.model != null) vehicle.model!,
                          ].join(' '),
                        ),
                    ],
                  ),
                const SizedBox(height: 28),

                // ─── Exit instructions ─────────────────────────────
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFBBF24).withOpacity(0.08),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                        color: const Color(0xFFFBBF24).withOpacity(0.2)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Icon(Icons.info_outline_rounded,
                          color: Color(0xFFFBBF24), size: 18),
                      SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'To exit: drive to the exit gate and scan its QR code, '
                          'or use the button below for a manual exit (demo mode).',
                          style: TextStyle(
                            color: Color(0xFF94A3B8),
                            fontSize: 13,
                            height: 1.5,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // ─── Manual exit button ────────────────────────────
                GradientButton(
                  key: const Key('manual_exit_button'),
                  label: 'Scan Exit Gate',
                  icon: Icons.qr_code_2_rounded,
                  loading: _exiting,
                  onPressed: _exiting ? null : () => context.push('/scan-exit'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final List<Widget> children;
  const _InfoCard({required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A2E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(
        children: children
            .expand((w) => [w, const SizedBox(height: 10)])
            .toList()
          ..removeLast(),
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final String label;
  final String value;
  final bool accent;

  const _Row({required this.label, required this.value, this.accent = false});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(color: Color(0xFF64748B), fontSize: 14),
        ),
        Text(
          value,
          style: TextStyle(
            color: accent ? const Color(0xFF6366F1) : Colors.white,
            fontSize: accent ? 18 : 14,
            fontWeight: accent ? FontWeight.w800 : FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
