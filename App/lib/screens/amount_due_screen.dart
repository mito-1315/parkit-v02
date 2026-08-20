import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/session_provider.dart';
import '../theme.dart';
import '../widgets/gradient_button.dart';

class AmountDueScreen extends ConsumerWidget {
  const AmountDueScreen({super.key});

  String _formatDuration(int? minutes, Duration fallback) {
    final m = minutes ?? fallback.inMinutes;
    final h = m ~/ 60;
    final rem = m % 60;
    if (h == 0) return '${rem}m';
    return '${h}h ${rem}m';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(lastCompletedSessionProvider);
    final fee = session?.parkingFee ?? 0;
    final currency = session?.currency ?? 'INR';

    return Scaffold(
      backgroundColor: Pk.bg,
      appBar: AppBar(
        backgroundColor: Pk.bg,
        title: const Text('Session Complete'),
        automaticallyImplyLeading: false,
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(color: Pk.border, height: 1),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const SizedBox(height: 32),

            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: Pk.success,
                borderRadius: Pk.r8,
              ),
              child: const Icon(Icons.check_rounded,
                  color: Colors.white, size: 38),
            ),
            const SizedBox(height: 20),

            const Text(
              'AMOUNT DUE',
              style: TextStyle(
                color: Pk.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '$currency ${fee.toStringAsFixed(2)}',
              key: const Key('amount_due_value'),
              style: const TextStyle(
                color: Pk.textPrimary,
                fontSize: 48,
                fontWeight: FontWeight.w900,
                fontFamily: 'monospace',
                letterSpacing: 2,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Duration: ${_formatDuration(session?.durationMinutes, session?.duration ?? Duration.zero)}',
              key: const Key('amount_due_duration'),
              style: const TextStyle(color: Pk.textSecondary, fontSize: 14),
            ),
            const SizedBox(height: 12),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Pk.warning.withOpacity(0.12),
                borderRadius: Pk.r6,
                border: Border.all(color: Pk.warning.withOpacity(0.3)),
              ),
              child: Text(
                session?.paymentStatus == 'PENDING'
                    ? 'Payment Pending'
                    : (session?.paymentStatus ?? 'Pending'),
                style: TextStyle(
                    color: Pk.warning,
                    fontSize: 12,
                    fontWeight: FontWeight.w600),
              ),
            ),

            const Spacer(),

            GradientButton(
              key: const Key('pay_later_button'),
              label: 'Pay at Counter — Done',
              icon: Icons.home_outlined,
              onPressed: () {
                ref.invalidate(sessionHistoryProvider);
                context.go('/home');
              },
            ),
          ],
        ),
      ),
    );
  }
}
