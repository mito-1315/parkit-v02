import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../models/parking_session.dart';
import '../providers/auth_provider.dart';
import '../providers/session_provider.dart';
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
      backgroundColor: const Color(0xFFF7F8FA),
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // ─── App Bar ──────────────────────────────────────────────────
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 24, 24, 0),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Hello, ${user?.name.split(' ').first ?? 'Parker'} 👋',
                            style: const TextStyle(
                              color: Color(0xFF94A3B8),
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 4),
                          ShaderMask(
                            shaderCallback: (b) => const LinearGradient(
                              colors: [Color(0xFF60A5FA), Color(0xFFA78BFA)],
                            ).createShader(b),
                            child: const Text(
                              'My Parking',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 26,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Logout
                    IconButton(
                      icon: const Icon(Icons.person_outline_rounded,
                          color: Color(0xFF64748B)),
                      onPressed: () => context.push('/profile'),
                    ),
                    IconButton(
                      icon: const Icon(Icons.logout_rounded,
                          color: Color(0xFF64748B)),
                      onPressed: () async {
                        await ref.read(authProvider.notifier).logout();
                      },
                    ),
                  ],
                ),
              ),
            ),

            // ─── Session status ───────────────────────────────────────────
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 28, 24, 0),
                child: sessionAsync.when(
                  loading: () => const _LoadingCard(),
                  error: (e, _) => _ErrorCard(message: e.toString()),
                  data: (session) => session == null || 
                      session.status == SessionStatus.completed ||
                      session.status == SessionStatus.cancelled
                      ? const _NoParkingCard()
                      : _ActiveCard(session: session),
                ),
              ),
            ),

            // ─── Quick Actions ────────────────────────────────────────────
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 28, 24, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Quick Actions',
                      style: TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _QuickActionCard(
                            icon: Icons.qr_code_scanner_rounded,
                            label: 'Scan Gate',
                            color: const Color(0xFF6366F1),
                            onTap: () => context.push('/scan-gate'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _QuickActionCard(
                            icon: Icons.directions_car_rounded,
                            label: 'Vehicles',
                            color: const Color(0xFF8B5CF6),
                            onTap: () => context.push('/vehicles'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _QuickActionCard(
                            icon: Icons.history_rounded,
                            label: 'History',
                            color: const Color(0xFF06B6D4),
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
      height: 120,
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A2E),
        borderRadius: BorderRadius.circular(20),
      ),
      child: const Center(
        child: CircularProgressIndicator(
          color: Color(0xFF6366F1),
          strokeWidth: 2,
        ),
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
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A2E),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF87171).withOpacity(0.3)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline_rounded,
              color: Color(0xFFF87171), size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(color: Color(0xFFF87171), fontSize: 13),
            ),
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
        color: const Color(0xFF1A1A2E),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: const Color(0xFF6366F1).withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.local_parking_rounded,
                color: Color(0xFF6366F1), size: 30),
          ),
          const SizedBox(height: 14),
          const Text(
            'Not Parked',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Scan a gate QR code to start a parking session',
            textAlign: TextAlign.center,
            style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
          ),
          const SizedBox(height: 20),
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
    return GestureDetector(
      onTap: () => context.push('/active-session'),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: session.status == SessionStatus.active
                ? [const Color(0xFF1E3A2F), const Color(0xFF0F2A1E)]
                : [const Color(0xFF1E2A4A), const Color(0xFF0F1D3A)],
          ),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: session.status == SessionStatus.active
                ? const Color(0xFF4ADE80).withOpacity(0.25)
                : const Color(0xFF60A5FA).withOpacity(0.25),
          ),
        ),
        child: Column(
          children: [
            SessionCard(session: session),
            const SizedBox(height: 12),
            GradientButton(
              label: 'View Active Session',
              icon: Icons.arrow_forward_rounded,
              onPressed: () => context.push('/active-session'),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionCard({
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
          color: const Color(0xFF1A1A2E),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.06)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 26),
            const SizedBox(height: 8),
            Text(
              label,
              style: const TextStyle(
                color: Color(0xFF94A3B8),
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
