import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../models/parking_session.dart';
import '../providers/session_provider.dart';
import '../theme.dart';
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
<<<<<<< HEAD
  final bool _exiting = false;
=======
  bool _exiting = false;
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d

  @override
  void initState() {
    super.initState();
    _startTicker();
    WidgetsBinding.instance.addPostFrameCallback((_) => _ensureConfirmed());
  }

  Future<void> _ensureConfirmed() async {
    final session = ref.read(activeSessionProvider).value;
    if (session != null && session.status == SessionStatus.reserved) {
      try {
        await ref.read(activeSessionProvider.notifier).confirmParked(session.id);
      } catch (_) {}
    }
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

  String _fmt(Duration d) {
    final h = d.inHours.toString().padLeft(2, '0');
    final m = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$h:$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    final sessionAsync = ref.watch(activeSessionProvider);

    return Scaffold(
      backgroundColor: Pk.bg,
      appBar: AppBar(
        backgroundColor: Pk.bg,
        title: const Text('Active Session'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => context.pop(),
        ),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(color: Pk.border, height: 1),
        ),
      ),
      body: sessionAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: Pk.primary, strokeWidth: 2),
        ),
        error: (e, _) => Center(
          child: Text(e.toString(),
              style: const TextStyle(color: Pk.dangerLt, fontSize: 13)),
        ),
        data: (session) {
          if (session == null || session.status == SessionStatus.completed) {
            return const Center(
              child: Text('No active session',
                  style: TextStyle(color: Pk.textSecondary)),
            );
          }

          final slot = session.slot;
          final vehicle = session.vehicle;
          final facilityName = session.facilityName ??
              slot?.zone?.facility?.name ??
              'Parking Facility';

          if (_elapsed == Duration.zero && session.entryTime != null) {
            _elapsed = DateTime.now().difference(session.entryTime!);
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ─── Elapsed timer ─────────────────────────────────────
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 28),
                  decoration: BoxDecoration(
                    color: Pk.surface,
                    borderRadius: Pk.r8,
<<<<<<< HEAD
                    border: Border.all(color: Pk.successLt.withAlpha((0.25 * 255).round())),
=======
                    border: Border.all(color: Pk.successLt.withOpacity(0.25)),
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 7,
                            height: 7,
<<<<<<< HEAD
                            decoration: const BoxDecoration(
=======
                            decoration: BoxDecoration(
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
                              color: Pk.successLt,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Text(
                            'TIME PARKED',
                            style: TextStyle(
                              color: Pk.successLt,
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1.0,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        _fmt(_elapsed),
                        key: const Key('elapsed_timer'),
                        style: const TextStyle(
                          color: Pk.textPrimary,
                          fontSize: 46,
                          fontWeight: FontWeight.w800,
                          fontFamily: 'monospace',
                          letterSpacing: 4,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // ─── Details ───────────────────────────────────────────
                _Section(children: [
                  _Row('Facility', facilityName),
                  _divider(),
                  _Row('Slot', slot?.label ?? '—', accent: true),
                  if (slot?.zone?.name != null) ...[
                    _divider(),
                    _Row('Zone', slot!.zone!.name),
                  ],
                  if (slot?.floor != null) ...[
                    _divider(),
                    _Row('Floor', slot!.floor.toString()),
                  ],
                ]),
                const SizedBox(height: 12),

                if (vehicle != null)
                  _Section(children: [
                    _Row('Plate', vehicle.licensePlate),
                    if (vehicle.make != null || vehicle.model != null) ...[
                      _divider(),
                      _Row(
                        'Vehicle',
                        [
                          if (vehicle.make != null) vehicle.make!,
                          if (vehicle.model != null) vehicle.model!,
                        ].join(' '),
                      ),
                    ],
                  ]),

                const SizedBox(height: 16),

                // ─── Info banner ───────────────────────────────────────
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Pk.surface2,
                    borderRadius: Pk.r6,
                    border: Border.all(color: Pk.border2),
                  ),
<<<<<<< HEAD
                  child: const Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
=======
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
                      Icon(Icons.info_outline_rounded,
                          color: Pk.textMuted, size: 16),
                      SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Drive to the exit gate and scan its QR code to end the session.',
                          style: TextStyle(
                              color: Pk.textSecondary,
                              fontSize: 13,
                              height: 1.5),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // ─── Exit button ───────────────────────────────────────
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

  Widget _divider() =>
      const Divider(color: Pk.border, height: 1, thickness: 1);
}

class _Section extends StatelessWidget {
  final List<Widget> children;
  const _Section({required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Pk.surface,
        borderRadius: Pk.r8,
        border: Border.all(color: Pk.border),
      ),
      child: Column(children: children),
    );
  }
}

class _Row extends StatelessWidget {
  final String label;
  final String value;
  final bool accent;
  const _Row(this.label, this.value, {this.accent = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(color: Pk.textSecondary, fontSize: 13)),
          Text(
            value,
            style: TextStyle(
              color: accent ? Pk.primaryLt : Pk.textPrimary,
              fontSize: accent ? 17 : 14,
              fontWeight: accent ? FontWeight.w800 : FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
