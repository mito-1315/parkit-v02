import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../models/parking_session.dart';
import '../providers/session_provider.dart';
import '../widgets/gradient_button.dart';
import '../widgets/slot_badge.dart';

class SlotAllocatedScreen extends ConsumerStatefulWidget {
  const SlotAllocatedScreen({super.key});

  @override
  ConsumerState<SlotAllocatedScreen> createState() =>
      _SlotAllocatedScreenState();
}

class _SlotAllocatedScreenState extends ConsumerState<SlotAllocatedScreen>
    with SingleTickerStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _scaleAnim;
  late Animation<double> _fadeAnim;
  Timer? _autoNav;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _scaleAnim = CurvedAnimation(parent: _ctrl, curve: Curves.elasticOut);
    _fadeAnim = CurvedAnimation(parent: _ctrl, curve: Curves.easeIn);
    _ctrl.forward();

    // Auto-navigate to active session after 8 s.
    _autoNav = Timer(const Duration(seconds: 8), () {
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
      backgroundColor: const Color(0xFF0A0A0F),
      body: SafeArea(
        child: sessionAsync.when(
          loading: () => const Center(
            child: CircularProgressIndicator(color: Color(0xFF6366F1)),
          ),
          error: (e, _) => Center(
            child: Text(e.toString(),
                style: const TextStyle(color: Color(0xFFF87171))),
          ),
          data: (session) {
            if (session == null) {
              return const Center(
                child: Text(
                  'No session found',
                  style: TextStyle(color: Color(0xFF94A3B8)),
                ),
              );
            }

            final slot = session.slot;
            final slotLabel = slot?.label ?? '—';
            final floor = slot?.floor;
            final zoneName = slot?.zone?.name ?? '—';
            final facilityName = session.facilityName ??
                slot?.zone?.facility?.name ??
                'Parking Facility';

            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 28),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Animated checkmark
                  ScaleTransition(
                    scale: _scaleAnim,
                    child: Container(
                      width: 90,
                      height: 90,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: const LinearGradient(
                          colors: [Color(0xFF22C55E), Color(0xFF16A34A)],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF22C55E).withOpacity(0.35),
                            blurRadius: 24,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: const Icon(Icons.check_rounded,
                          color: Colors.white, size: 48),
                    ),
                  ),
                  const SizedBox(height: 28),

                  FadeTransition(
                    opacity: _fadeAnim,
                    child: Column(
                      children: [
                        const Text(
                          'Slot Allocated!',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 28,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          facilityName,
                          style: const TextStyle(
                            color: Color(0xFF94A3B8),
                            fontSize: 15,
                          ),
                        ),
                        const SizedBox(height: 32),
                        SlotBadge(
                          code: slotLabel,
                          zoneLabel: floor != null
                              ? '$zoneName · Floor $floor'
                              : zoneName,
                        ),
                        const SizedBox(height: 16),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1A1A2E),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                                color: const Color(0xFF6366F1)
                                    .withOpacity(0.3)),
                          ),
                          child: Column(
                            children: [
                              _InfoRow(label: 'Zone', value: zoneName),
                              if (floor != null) ...[
                                const SizedBox(height: 12),
                                _InfoRow(
                                    label: 'Floor',
                                    value: floor.toString()),
                              ],
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Directions text
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color:
                                const Color(0xFF6366F1).withOpacity(0.08),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                                color: const Color(0xFF6366F1)
                                    .withOpacity(0.15)),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Icon(Icons.info_outline_rounded,
                                  color: Color(0xFF6366F1), size: 18),
                              SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  'Proceed to your assigned slot. Follow the facility signs. '
                                  'Map integration coming in Phase 8.',
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
                        const SizedBox(height: 32),

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
                        const SizedBox(height: 12),
                        Text(
                          'Auto-navigating in 8 seconds…',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.3),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final TextStyle? valueStyle;

  const _InfoRow({
    required this.label,
    required this.value,
    this.valueStyle,
  });

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
          style: valueStyle ??
              const TextStyle(
                color: Colors.white,
                fontSize: 15,
                fontWeight: FontWeight.w700,
              ),
        ),
      ],
    );
  }
}
