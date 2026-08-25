import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/parking_session.dart';
import '../services/api_client.dart';
import 'auth_provider.dart';
import 'socket_provider.dart';

// ─── History (read-only) ─────────────────────────────────────────────────────

final sessionHistoryProvider =
    FutureProvider<List<ParkingSession>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final all = await api.getSessionHistory();
  return all
      .where((s) => s.status == SessionStatus.completed)
      .toList()
    ..sort((a, b) =>
        (b.entryTime ?? DateTime(0)).compareTo(a.entryTime ?? DateTime(0)));
});

// ─── Active session notifier ─────────────────────────────────────────────────

class SessionNotifier
    extends StateNotifier<AsyncValue<ParkingSession?>> {
  SessionNotifier(this._api, this._ref)
      : super(const AsyncValue.loading()) {
    _load();
  }

  final ApiClient _api;
  final Ref _ref;
  StreamSubscription<Map<String, dynamic>>? _socketSub;
  Timer? _pollTimer;

  // ─── Initialise ─────────────────────────────────────────────────────────────

  Future<void> _load() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _api.getActiveSession());
    _subscribeSocket();
  }

  void _subscribeSocket() {
    _socketSub?.cancel();
    final socket = _ref.read(socketServiceProvider);
    _socketSub = socket.updates.listen(_handleSocketEvent);
  }

  void _handleSocketEvent(Map<String, dynamic> event) {
    // Refresh local state whenever the backend emits any slot/session update.
    refresh();
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  Future<void> refresh() async {
    try {
      final session = await _api.getActiveSession();
      state = AsyncValue.data(session);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  /// Scan an entry gate (detect plate, do not allocate yet).
  Future<PlateDetection> scanEntry({required int gateId, String? forcePlate}) {
    return _api.scanEntry(gateId: gateId, forcePlate: forcePlate);
  }

  Future<ParkingSession> confirmEntry({
    required int gateId,
    required String licensePlate,
  }) async {
    final session = await _api.confirmEntry(gateId: gateId, licensePlate: licensePlate);
    state = AsyncValue.data(session);
    _startPolling();
    return session;
  }

  /// Initiate parking allocation (legacy / fallback).
  Future<ParkingSession> startAllocation({
    required String licensePlate,
    int? entryGateId,
    String? qrCode,
  }) async {
    final session = await _api.allocate(
      licensePlate: licensePlate,
      entryGateId: entryGateId,
      qrCode: qrCode,
    );
    state = AsyncValue.data(session);
    // Start polling in background while we wait for AI detection.
    _startPolling();
    return session;
  }

  /// Poll every 3 s until session is no longer DETECTING.
  void _startPolling() {
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(const Duration(seconds: 3), (_) async {
      await refresh();
      final s = state.value;
      if (s != null && !s.status.isPending) {
        _pollTimer?.cancel();
      }
    });
  }

  Future<ParkingSession> confirmParked(int sessionId) async {
    final session = await _api.confirmParked(sessionId);
    state = AsyncValue.data(session);
    return session;
  }

  Future<ParkingSession> scanExit({required int gateId, int? sessionId}) async {
    final session = await _api.scanExit(gateId: gateId, sessionId: sessionId);
    _ref.read(lastCompletedSessionProvider.notifier).state = session;
    state = const AsyncValue.data(null);
    return session;
  }

  Future<ParkingSession> confirmExit(int sessionId,
      {int exitGateId = 1}) async {
    final session = await _api.confirmExit(sessionId, exitGateId);
    state = const AsyncValue.data(null);
    return session;
  }

  @override
  void dispose() {
    _socketSub?.cancel();
    _pollTimer?.cancel();
    super.dispose();
  }
}

final lastCompletedSessionProvider = StateProvider<ParkingSession?>((ref) => null);

final pendingEntryProvider = StateProvider<PlateDetection?>((ref) => null);

final activeSessionProvider =
    StateNotifierProvider<SessionNotifier, AsyncValue<ParkingSession?>>((ref) {
  final api = ref.watch(apiClientProvider);
  return SessionNotifier(api, ref);
});

class PendingGateScan {
  final int gateId;
  final String licensePlate;
  final double confidence;
  const PendingGateScan({
    required this.gateId,
    required this.licensePlate,
    required this.confidence,
  });
}

