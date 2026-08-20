import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../providers/session_provider.dart';
import '../widgets/gradient_button.dart';

class ScanExitScreen extends ConsumerStatefulWidget {
  const ScanExitScreen({super.key});

  @override
  ConsumerState<ScanExitScreen> createState() => _ScanExitScreenState();
}

class _ScanExitScreenState extends ConsumerState<ScanExitScreen> {
  final MobileScannerController _scanCtrl = MobileScannerController();
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _scanCtrl.dispose();
    super.dispose();
  }

  int? _parseGateId(String raw) {
    final trimmed = raw.trim();
    final asInt = int.tryParse(trimmed);
    if (asInt != null) return asInt;
    try {
      final decoded = jsonDecode(trimmed) as Map<String, dynamic>;
      return (decoded['gateId'] ?? decoded['gate_id'] ?? decoded['id']) as int?;
    } catch (_) {
      return null;
    }
  }

  Future<void> _exit(int gateId) async {
    if (_busy) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final active = ref.read(activeSessionProvider).value;
      final completed = await ref.read(activeSessionProvider.notifier).scanExit(
            gateId: gateId,
            sessionId: active?.id,
          );
      ref.read(lastCompletedSessionProvider.notifier).state = completed;
      if (!mounted) return;
      context.pushReplacement('/amount-due');
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0A0F),
        title: const Text('Scan Exit Gate',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
      ),
      body: Column(
        children: [
          Expanded(
            child: Stack(
              children: [
                MobileScanner(
                  controller: _scanCtrl,
                  onDetect: (capture) {
                    final raw = capture.barcodes.firstOrNull?.rawValue;
                    if (raw == null) return;
                    final id = _parseGateId(raw) ?? 2;
                    _exit(id);
                  },
                ),
                if (_busy)
                  const ColoredBox(
                    color: Colors.black54,
                    child: Center(
                      child: CircularProgressIndicator(color: Color(0xFF6366F1)),
                    ),
                  ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
            child: Column(
              children: [
                if (_error != null)
                  Text(_error!, style: const TextStyle(color: Color(0xFFF87171))),
                GradientButton(
                  key: const Key('simulate_exit_scan_button'),
                  label: 'Simulate Exit Scan',
                  icon: Icons.qr_code_2_rounded,
                  loading: _busy,
                  onPressed: _busy ? null : () => _exit(2),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
