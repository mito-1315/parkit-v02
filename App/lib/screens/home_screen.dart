import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../models/parking_session.dart';
import '../providers/auth_provider.dart';
import '../providers/session_provider.dart';
import '../theme.dart';
import '../widgets/gradient_button.dart';
import '../widgets/session_card.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userAsync = ref.watch(authProvider);
    final sessionAsync = ref.watch(activeSessionProvider);
    final user = userAsync.value;

    return Scaffold(
      backgroundColor: Pk.bg,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // ─── Header ───────────────────────────────────────────────
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 12, 0),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Hello, ${user?.name.split(' ').first ?? 'there'}',
                            style: const TextStyle(
                              color: Pk.textSecondary,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'Parkit',
                            style: TextStyle(
                              color: Pk.textPrimary,
                              fontSize: 24,
                              fontWeight: FontWeight.w800,
                              letterSpacing: -0.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.person_outline_rounded,
                          color: Pk.textSecondary, size: 22),
                      onPressed: () => context.push('/profile'),
                    ),
                    IconButton(
                      icon: const Icon(Icons.logout_rounded,
                          color: Pk.textSecondary, size: 22),
                      onPressed: () =>
                          ref.read(authProvider.notifier).logout(),
                    ),
                  ],
                ),
              ),
            ),

            // ─── Divider ──────────────────────────────────────────────
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.fromLTRB(20, 16, 20, 0),
                child: Divider(color: Pk.border, height: 1),
              ),
            ),

            // ─── Session status ───────────────────────────────────────
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                child: sessionAsync.when(
                  loading: () => const _LoadingCard(),
                  error: (e, _) => _ErrorCard(message: e.toString()),
                  data: (session) =>
                      session == null ||
                              session.status == SessionStatus.completed ||
                              session.status == SessionStatus.cancelled
                          ? const _NoParkingCard()
                          : _ActiveCard(session: session),
                ),
              ),
            ),

            // ─── Quick Actions ────────────────────────────────────────
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'QUICK ACTIONS',
                      style: TextStyle(
                        color: Pk.textMuted,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.0,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: _ActionTile(
                            icon: Icons.qr_code_scanner_rounded,
                            label: 'Scan Gate',
                            color: Pk.primary,
                            onTap: () => context.push('/scan-gate'),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _ActionTile(
                            icon: Icons.directions_car_outlined,
                            label: 'Vehicles',
                            color: const Color(0xFF7C3AED),
                            onTap: () => context.push('/vehicles'),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _ActionTile(
                            icon: Icons.history_rounded,
                            label: 'History',
                            color: const Color(0xFF0891B2),
                            onTap: () => context.push('/history'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 32)),
          ],
        ),
      ),
    );
  }
}

class _LoadingCard extends StatelessWidget {
  const _LoadingCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 100,
      decoration: BoxDecoration(
        color: Pk.surface,
        borderRadius: Pk.r8,
        border: Border.all(color: Pk.border),
      ),
      child: const Center(
        child: CircularProgressIndicator(color: Pk.primary, strokeWidth: 2),
      ),
    );
  }
}

class _ErrorCard extends StatelessWidget {
  final String message;
  const _ErrorCard({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
        color: Pk.surface,
        borderRadius: Pk.r8,
        border: Border.all(color: Pk.danger.withAlpha((0.4 * 255).round())),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline_rounded, color: Pk.dangerLt, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(message,
                style: const TextStyle(color: Pk.dangerLt, fontSize: 13)),
          ),
        ],
      ),
    );
  }
}

class _NoParkingCard extends StatelessWidget {
  const _NoParkingCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Pk.surface,
        borderRadius: Pk.r8,
        border: Border.all(color: Pk.border),
      ),
      child: Column(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: Pk.primary.withAlpha((0.12 * 255).round()),
              borderRadius: Pk.r8,
            ),
            child:
                const Icon(Icons.local_parking_rounded, color: Pk.primary, size: 26),
          ),
          const SizedBox(height: 14),
          const Text(
            'Not Parked',
            style: TextStyle(
              color: Pk.textPrimary,
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Scan an entry gate QR code to start a session',
            textAlign: TextAlign.center,
            style: TextStyle(color: Pk.textSecondary, fontSize: 13),
          ),
          const SizedBox(height: 18),
          GradientButton(
            key: const Key('scan_gate_button'),
            label: 'Scan Gate QR',
            icon: Icons.qr_code_scanner_rounded,
            onPressed: () => context.push('/scan-gate'),
          ),
        ],
      ),
    );
  }
}

class _ActiveCard extends StatelessWidget {
  final ParkingSession session;
  const _ActiveCard({required this.session});

  @override
  Widget build(BuildContext context) {
    final isActive = session.status == SessionStatus.active;
    final accentColor = isActive ? Pk.successLt : Pk.primaryLt;

    return GestureDetector(
      onTap: () => context.push('/active-session'),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: Pk.surface,
          borderRadius: Pk.r8,
          border: Border.all(color: accentColor.withAlpha((0.35 * 255).round())),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: isActive ? Pk.successLt : Pk.primaryLt,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  isActive ? 'Active Session' : 'Reserved',
                  style: TextStyle(
                    color: accentColor,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.4,
                  ),
                ),
                const Spacer(),
                const Icon(Icons.chevron_right_rounded,
                    color: Pk.textMuted, size: 18),
              ],
            ),
            const SizedBox(height: 12),
            SessionCard(session: session),
            const SizedBox(height: 14),
            GradientButton(
              label: 'View Session',
              icon: Icons.arrow_forward_rounded,
              onPressed: () => context.push('/active-session'),
            ),
          ],
        ),
      ),
    );
  }
}

class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionTile({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: Pk.surface,
          borderRadius: Pk.r8,
          border: Border.all(color: Pk.border),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 8),
            Text(
              label,
              style: const TextStyle(
                color: Pk.textSecondary,
                fontSize: 11,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
