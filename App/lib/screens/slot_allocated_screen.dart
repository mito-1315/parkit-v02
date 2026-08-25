import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../models/parking_session.dart';
import '../providers/session_provider.dart';
import '../theme.dart';
import '../widgets/gradient_button.dart';
import '../widgets/slot_badge.dart';

class SlotAllocatedScreen extends ConsumerStatefulWidget {
  const SlotAllocatedScreen({super.key});

  @override
  ConsumerState<SlotAllocatedScreen> createState() =>
      _SlotAllocatedScreenState();
}

class _SlotAllocatedScreenState extends ConsumerState<SlotAllocatedScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _scaleAnim;
  late Animation<double> _fadeAnim;
  Timer? _autoNav;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _scaleAnim = CurvedAnimation(parent: _ctrl, curve: Curves.easeOut);
    _fadeAnim = CurvedAnimation(parent: _ctrl, curve: Curves.easeIn);
    _ctrl.forward();

    _autoNav = Timer(const Duration(seconds: 8), () async {
      if (!mounted) return;
      try {
        final session = ref.read(activeSessionProvider).value;
        if (session != null && session.status != SessionStatus.active) {
          await ref
              .read(activeSessionProvider.notifier)
              .confirmParked(session.id);
        }
      } catch (_) {}
      if (mounted) context.pushReplacement('/active-session');
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _autoNav?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final sessionAsync = ref.watch(activeSessionProvider);

    return Scaffold(
      backgroundColor: Pk.bg,
      body: SafeArea(
        child: sessionAsync.when(
          loading: () => const Center(
            child: CircularProgressIndicator(color: Pk.primary, strokeWidth: 2),
          ),
          error: (e, _) => Center(
            child: Text(e.toString(),
                style: const TextStyle(color: Pk.dangerLt, fontSize: 13)),
          ),
          data: (session) {
            if (session == null) {
              return const Center(
                child: Text('No session found',
                    style: TextStyle(color: Pk.textSecondary)),
              );
            }

            final slot = session.slot;
            final slotLabel = slot?.label ?? '—';
            final floor = slot?.floor;
            final zoneName = slot?.zone?.name ?? '—';
            final facilityName = session.facilityName ??
                slot?.zone?.facility?.name ??
                'Parking Facility';

            return FadeTransition(
              opacity: _fadeAnim,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // ─── Check icon ──────────────────────────────────
                    ScaleTransition(
                      scale: _scaleAnim,
                      child: Container(
                        width: 80,
                        height: 80,
<<<<<<< HEAD
                        decoration: const BoxDecoration(
=======
                        decoration: BoxDecoration(
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
                          color: Pk.success,
                          borderRadius: Pk.r8,
                        ),
                        child: const Icon(
                          Icons.check_rounded,
                          color: Colors.white,
                          size: 44,
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    const Text(
                      'Slot Assigned',
                      style: TextStyle(
                        color: Pk.textPrimary,
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.2,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      facilityName,
                      style: const TextStyle(
                          color: Pk.textSecondary, fontSize: 13),
                    ),
                    const SizedBox(height: 28),

                    // ─── Slot badge ──────────────────────────────────
                    SlotBadge(label: slotLabel, large: true),
                    const SizedBox(height: 24),

                    // ─── Info table ──────────────────────────────────
                    Container(
                      decoration: BoxDecoration(
                        color: Pk.surface,
                        borderRadius: Pk.r8,
                        border: Border.all(color: Pk.border),
                      ),
                      child: Column(
                        children: [
                          _Row('Zone', zoneName),
                          const Divider(color: Pk.border, height: 1),
                          if (floor != null)
                            _Row('Floor', 'Level $floor'),
                          if (floor != null)
                            const Divider(color: Pk.border, height: 1),
<<<<<<< HEAD
                          const _Row('Status', 'Reserved'),
=======
                          _Row('Status', 'Reserved'),
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // ─── Navigation note ─────────────────────────────
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
                              'Proceed to your assigned slot and press '
                              '"Confirm Parked" when you arrive.',
                              style: TextStyle(
                                  color: Pk.textSecondary,
                                  fontSize: 13,
                                  height: 1.5),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // ─── Confirm button ──────────────────────────────
                    GradientButton(
                      key: const Key('view_session_button'),
                      label: 'Confirm Parked',
                      icon: Icons.check_rounded,
                      onPressed: () async {
                        try {
                          if (session.status != SessionStatus.active) {
                            await ref
                                .read(activeSessionProvider.notifier)
                                .confirmParked(session.id);
                          }
                        } catch (_) {}
                        if (context.mounted) {
                          context.pushReplacement('/active-session');
                        }
                      },
                    ),
                    const SizedBox(height: 10),
<<<<<<< HEAD
                      Text(
                      'Auto-navigating in 8 seconds…',
                      style: TextStyle(
                        color: Colors.white.withAlpha((0.2 * 255).round()),
=======
                    Text(
                      'Auto-navigating in 8 seconds…',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.2),
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final String label;
  final String value;
  const _Row(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(color: Pk.textSecondary, fontSize: 13)),
          Text(value,
              style: const TextStyle(
                  color: Pk.textPrimary,
                  fontSize: 14,
                  fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
