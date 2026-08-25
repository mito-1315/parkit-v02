import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../providers/session_provider.dart';
import '../theme.dart';
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

  (int?, String?) _parseQr(String raw) {
    final asInt = int.tryParse(raw.trim());
    if (asInt != null) return (asInt, null);
    try {
      final decoded = jsonDecode(raw.trim()) as Map<String, dynamic>;
      final id = (decoded['gateId'] ?? decoded['gate_id'] ?? decoded['id']) as int?;
      final type = (decoded['type'] as String?)?.toUpperCase();
      return (id, type);
    } catch (_) {
      return (null, null);
    }
  }

  Future<void> _exit(int gateId, {String? qrType}) async {
    // Reject if QR belongs to an entry gate.
    if (qrType != null && qrType != 'EXIT') {
      setState(() => _error =
          'This is an entry gate QR. Please scan an EXIT gate QR code.');
      return;
    }
    if (_busy) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final active = ref.read(activeSessionProvider).value;
      final completed = await ref
          .read(activeSessionProvider.notifier)
          .scanExit(gateId: gateId, sessionId: active?.id);
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
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text('Scan Exit Gate'),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(color: Pk.border, height: 1),
        ),
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
                    final (id, type) = _parseQr(raw);
                    _exit(id ?? 2, qrType: type);
                  },
                ),
                Center(
                  child: Container(
                    width: 210,
                    height: 210,
                    decoration: BoxDecoration(
                      border: Border.all(color: Pk.warning, width: 2),
                      borderRadius: Pk.r8,
                    ),
                  ),
                ),
                if (_busy)
                  const ColoredBox(
                    color: Colors.black54,
                    child: Center(
                      child: CircularProgressIndicator(
                          color: Pk.primary, strokeWidth: 2),
                    ),
                  ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
            decoration: const BoxDecoration(
              color: Pk.surface,
              border: Border(top: BorderSide(color: Pk.border)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Point camera at the exit gate QR code',
                  style: TextStyle(color: Pk.textSecondary, fontSize: 13),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 10),
                  Text(_error!,
                      style: const TextStyle(
                          color: Pk.dangerLt, fontSize: 13)),
                ],
                const SizedBox(height: 16),
                GradientButton(
                  key: const Key('simulate_exit_scan_button'),
                  label: 'Simulate Exit Scan',
                  icon: Icons.qr_code_2_rounded,
                  loading: _busy,
                  onPressed: _busy ? null : () => _exit(2, qrType: 'EXIT'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
