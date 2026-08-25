import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../providers/session_provider.dart';
import '../theme.dart';
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

  /// Returns `(gateId, type)`. type is 'ENTRY', 'EXIT', or null (unknown).
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

  Future<void> _startFlow({int? gateId, String? qrType}) async {
    if (gateId == null || _scanned || _loading) return;

    // Validate gate type if the QR includes it.
    if (qrType != null) {
      final expected = widget.isExit ? 'EXIT' : 'ENTRY';
      if (qrType != expected) {
        setState(() {
          _errorMsg = widget.isExit
              ? 'This is an entry gate QR. Please scan an EXIT gate QR code.'
              : 'This is an exit gate QR. Please scan an ENTRY gate QR code.';
        });
        return;
      }
    }
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
        final detection = await ref
            .read(activeSessionProvider.notifier)
            .scanEntry(gateId: gateId);
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
    final (id, type) = _parseQr(barcode!.rawValue!);
    await _startFlow(gateId: id ?? 1, qrType: type);
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.isExit ? 'Scan Exit Gate' : 'Scan Entry Gate';
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: Text(title),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => context.pop(),
        ),
        elevation: 0,
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
                    key: const Key('qr_scanner'),
                    controller: _scanCtrl,
                    onDetect: _onDetect),
                Center(
                  child: Container(
                    width: 210,
                    height: 210,
                    decoration: BoxDecoration(
                      border: Border.all(color: Pk.primaryLt, width: 2),
                      borderRadius: Pk.r8,
                    ),
                  ),
                ),
                if (_loading)
                  Container(
                    color: Colors.black54,
                    child: const Center(
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
                Text(
                  widget.isExit
                      ? 'Point camera at the exit gate QR code'
                      : 'Point camera at the entry gate QR code',
                  style: const TextStyle(
                      color: Pk.textSecondary, fontSize: 13),
                ),
                if (_errorMsg != null) ...[
                  const SizedBox(height: 10),
                  Text(_errorMsg!,
                      style: const TextStyle(
                          color: Pk.dangerLt, fontSize: 13)),
                ],
                const SizedBox(height: 16),
                GradientButton(
                  key: const Key('simulate_scan_button'),
                  label: 'Simulate Scan',
                  icon: Icons.qr_code_2_rounded,
                  onPressed: () => _startFlow(
                    gateId: widget.isExit ? 2 : 1,
                    qrType: widget.isExit ? 'EXIT' : 'ENTRY',
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
