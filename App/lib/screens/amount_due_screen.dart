import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/session_provider.dart';
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
      backgroundColor: const Color(0xFF0A0A0F),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0A0F),
        title: const Text('Amount Due', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const SizedBox(height: 24),
            const Text('AMOUNT DUE', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12, letterSpacing: 1.4)),
            const SizedBox(height: 8),
            Text(
              '$currency ${fee.toStringAsFixed(2)}',
              key: const Key('amount_due_value'),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 48,
                fontWeight: FontWeight.w900,
                fontFamily: 'monospace',
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Duration ${_formatDuration(session?.durationMinutes, session?.duration ?? Duration.zero)}',
              key: const Key('amount_due_duration'),
              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
            ),
            const SizedBox(height: 12),
            Text(
              session?.paymentStatus == 'PENDING' ? 'Payment status: PENDING' : (session?.paymentStatus ?? 'PENDING'),
              style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 13),
            ),
            const Spacer(),
            GradientButton(
              key: const Key('pay_later_button'),
              label: 'Pay Later',
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
