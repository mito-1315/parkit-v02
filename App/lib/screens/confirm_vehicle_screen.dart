import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/session_provider.dart';
import '../widgets/gradient_button.dart';

class ConfirmVehicleScreen extends ConsumerStatefulWidget {
  final int gateId;
  const ConfirmVehicleScreen({super.key, required this.gateId});

  @override
  ConsumerState<ConfirmVehicleScreen> createState() => _ConfirmVehicleScreenState();
}

class _ConfirmVehicleScreenState extends ConsumerState<ConfirmVehicleScreen> {
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
      backgroundColor: const Color(0xFF0A0A0F),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0A0F),
        title: const Text('Confirm Vehicle', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Detected plate', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
            const SizedBox(height: 12),
            TextField(
              key: const Key('plate_field'),
              controller: _plateCtrl,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 32,
                fontWeight: FontWeight.w800,
                fontFamily: 'monospace',
                letterSpacing: 2,
              ),
              decoration: InputDecoration(
                suffixText: 'Edit',
                suffixStyle: const TextStyle(color: Color(0xFF6366F1), fontSize: 13),
                filled: true,
                fillColor: const Color(0xFF1A1A2E),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            if (lowConfidence) ...[
              const SizedBox(height: 8),
              const Text(
                'Low confidence, please check',
                key: Key('low_confidence_note'),
                style: TextStyle(color: Color(0xFFFBBF24), fontSize: 12),
              ),
            ],
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(_error!, style: const TextStyle(color: Color(0xFFF87171))),
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
