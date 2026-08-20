import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../providers/session_provider.dart';
import '../widgets/gradient_button.dart';

class ScanGateScreen extends ConsumerStatefulWidget {
  final bool isExit;
  const ScanGateScreen({super.key, this.isExit = false});

  @override
  ConsumerState<ScanGateScreen> createState() => _ScanGateScreenState();
}

class _ScanGateScreenState extends ConsumerState<ScanGateScreen> {
  final MobileScannerController _scanCtrl = MobileScannerController();
  bool _scanned = false;
  bool _loading = false;
  String? _errorMsg;

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

  Future<void> _startFlow({int? gateId}) async {
    if (gateId == null || _scanned || _loading) return;
    try {
      setState(() {
        _scanned = true;
        _loading = true;
        _errorMsg = null;
      });
      if (widget.isExit) {
        final session = ref.read(activeSessionProvider).value;
        final completed = await ref.read(activeSessionProvider.notifier).scanExit(
              gateId: gateId,
              sessionId: session?.id,
            );
        if (!mounted) return;
        ref.read(lastCompletedSessionProvider.notifier).state = completed;
        context.pushReplacement('/amount-due');
      } else {
        final detection = await ref.read(activeSessionProvider.notifier).scanEntry(gateId: gateId);
        if (!mounted) return;
        ref.read(pendingEntryProvider.notifier).state = detection;
        context.pushReplacement('/confirm-vehicle?gateId=$gateId');
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _scanned = false;
        _errorMsg = e.toString().replaceFirst('ApiException', '').trim();
      });
    }
  }

  Future<void> _onDetect(BarcodeCapture capture) async {
    if (_scanned || _loading) return;
    final barcode = capture.barcodes.firstOrNull;
    if (barcode?.rawValue == null) return;
    await _startFlow(gateId: _parseGateId(barcode!.rawValue!) ?? 1);
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.isExit ? 'Scan Exit Gate' : 'Scan Gate';
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0A0F),
        title: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 18)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF94A3B8)),
          onPressed: () => context.pop(),
        ),
        elevation: 0,
      ),
      body: Column(
        children: [
          Expanded(
            child: Stack(
              children: [
                MobileScanner(key: const Key('qr_scanner'), controller: _scanCtrl, onDetect: _onDetect),
                Center(
                  child: Container(
                    width: 220,
                    height: 220,
                    decoration: BoxDecoration(
                      border: Border.all(color: const Color(0xFF6366F1), width: 2.5),
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                ),
                if (_loading)
                  Container(
                    color: Colors.black54,
                    child: const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1))),
                  ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
            decoration: const BoxDecoration(
              color: Color(0xFF111827),
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.isExit
                      ? 'Point camera at the exit gate QR code'
                      : 'Point camera at the gate QR code',
                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                ),
                if (_errorMsg != null) ...[
                  const SizedBox(height: 12),
                  Text(_errorMsg!, style: const TextStyle(color: Color(0xFFF87171), fontSize: 13)),
                ],
                const SizedBox(height: 16),
                GradientButton(
                  key: const Key('simulate_scan_button'),
                  label: 'Simulate Scan',
                  icon: Icons.qr_code_2_rounded,
                  onPressed: () => _startFlow(gateId: widget.isExit ? 2 : 1),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
