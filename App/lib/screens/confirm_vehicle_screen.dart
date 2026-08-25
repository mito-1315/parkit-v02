import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/session_provider.dart';
import '../theme.dart';
import '../widgets/gradient_button.dart';

class ConfirmVehicleScreen extends ConsumerStatefulWidget {
  final int gateId;
  const ConfirmVehicleScreen({super.key, required this.gateId});

  @override
  ConsumerState<ConfirmVehicleScreen> createState() =>
      _ConfirmVehicleScreenState();
}

class _ConfirmVehicleScreenState
    extends ConsumerState<ConfirmVehicleScreen> {
  late final TextEditingController _plateCtrl;
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    final detected = ref.read(pendingEntryProvider);
    _plateCtrl = TextEditingController(text: detected?.licensePlate ?? '');
  }

  @override
  void dispose() {
    _plateCtrl.dispose();
    super.dispose();
  }

  Future<void> _confirm() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await ref.read(activeSessionProvider.notifier).confirmEntry(
            gateId: widget.gateId,
            licensePlate: _plateCtrl.text.trim(),
          );
      if (!mounted) return;
      context.pushReplacement('/slot-allocated');
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final detected = ref.watch(pendingEntryProvider);
    final lowConfidence = (detected?.confidence ?? 1) < 0.8;

    return Scaffold(
      backgroundColor: Pk.bg,
      appBar: AppBar(
        backgroundColor: Pk.bg,
        title: const Text('Confirm Vehicle'),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(color: Pk.border, height: 1),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),
            const Text(
              'DETECTED PLATE',
              style: TextStyle(
                color: Pk.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.0,
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              key: const Key('plate_field'),
              controller: _plateCtrl,
              style: const TextStyle(
                color: Pk.textPrimary,
                fontSize: 28,
                fontWeight: FontWeight.w800,
                fontFamily: 'monospace',
                letterSpacing: 3,
              ),
<<<<<<< HEAD
              decoration: const InputDecoration(
=======
              decoration: InputDecoration(
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
                suffixText: 'edit',
                suffixStyle: TextStyle(
                    color: Pk.primary, fontSize: 12),
                filled: true,
                fillColor: Pk.surface,
<<<<<<< HEAD
                contentPadding: EdgeInsets.symmetric(
                    horizontal: 16, vertical: 16),
                border: OutlineInputBorder(
                  borderRadius: Pk.r6,
                  borderSide: BorderSide(color: Pk.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: Pk.r6,
                  borderSide: BorderSide(color: Pk.border),
=======
                contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 16),
                border: OutlineInputBorder(
                  borderRadius: Pk.r6,
                  borderSide: const BorderSide(color: Pk.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: Pk.r6,
                  borderSide: const BorderSide(color: Pk.border),
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: Pk.r6,
                  borderSide:
<<<<<<< HEAD
                      BorderSide(color: Pk.primary, width: 1.5),
=======
                      const BorderSide(color: Pk.primary, width: 1.5),
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
                ),
              ),
            ),
            if (lowConfidence) ...[
              const SizedBox(height: 8),
              const Row(
                children: [
                  Icon(Icons.warning_amber_rounded,
                      color: Color(0xFFFBBF24), size: 14),
                  SizedBox(width: 6),
                  Text(
                    'Low confidence — please verify',
                    key: Key('low_confidence_note'),
                    style: TextStyle(
                        color: Color(0xFFFBBF24), fontSize: 12),
                  ),
                ],
              ),
            ],
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(_error!,
                  style:
                      const TextStyle(color: Pk.dangerLt, fontSize: 13)),
            ],
            const Spacer(),
            GradientButton(
              key: const Key('confirm_vehicle_button'),
              label: 'Confirm — this is my vehicle',
              loading: _loading,
              onPressed: _loading ? null : _confirm,
            ),
          ],
        ),
      ),
    );
  }
}
