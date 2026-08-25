import 'dart:async';

import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/parking_session.dart';
import '../models/user.dart';
import '../models/vehicle.dart';

const _baseUrl = 'http://192.168.0.114:4000/api/v1';
const _keyAccess = 'accessToken';
const _keyRefresh = 'refreshToken';

class AuthResponse {
  final String accessToken;
  final String refreshToken;

  const AuthResponse({required this.accessToken, required this.refreshToken});

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
    );
  }
}

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  const ApiException(this.message, {this.statusCode});

  @override
  String toString() => 'ApiException($statusCode): $message';
}

class ApiClient {
  late final Dio _dio;
  final SharedPreferences _prefs;

  /// Tracks whether we are currently refreshing to avoid infinite loops.
  bool _isRefreshing = false;
  final _refreshQueue = <Completer<void>>[];

  ApiClient(this._prefs) {
    _dio = Dio(BaseOptions(
      baseUrl: _baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
      contentType: 'application/json',
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: _onRequest,
      onError: _onError,
    ));
  }

  // ─── Token helpers ──────────────────────────────────────────────────────────

  String? get accessToken => _prefs.getString(_keyAccess);
  String? get refreshToken => _prefs.getString(_keyRefresh);

  Future<void> saveTokens(String access, String refresh) async {
    await _prefs.setString(_keyAccess, access);
    await _prefs.setString(_keyRefresh, refresh);
  }

  Future<void> clearTokens() async {
    await _prefs.remove(_keyAccess);
    await _prefs.remove(_keyRefresh);
  }

  bool get isLoggedIn => accessToken != null;

  // ─── Interceptors ───────────────────────────────────────────────────────────

  void _onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) {
    final token = accessToken;
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  Future<void> _onError(
    DioException error,
    ErrorInterceptorHandler handler,
  ) async {
    if (error.response?.statusCode != 401) {
      handler.next(error);
      return;
    }

    final refresh = refreshToken;
    if (refresh == null) {
      handler.next(error);
      return;
    }

    // If already refreshing, queue this retry.
    if (_isRefreshing) {
      final completer = Completer<void>();
      _refreshQueue.add(completer);
      await completer.future;
      handler.resolve(
        await _dio.fetch(error.requestOptions),
      );
      return;
    }

    _isRefreshing = true;

    try {
      final resp = await Dio().post(
        '$_baseUrl/auth/refresh',
        data: {'refreshToken': refresh},
      );
      final newAccess = resp.data['accessToken'] as String;
      await _prefs.setString(_keyAccess, newAccess);

      // Drain queue.
      for (final c in _refreshQueue) {
        c.complete();
      }
      _refreshQueue.clear();

      // Retry original request.
      error.requestOptions.headers['Authorization'] = 'Bearer $newAccess';
      handler.resolve(await _dio.fetch(error.requestOptions));
    } catch (_) {
      await clearTokens();
      for (final c in _refreshQueue) {
        c.completeError(error);
      }
      _refreshQueue.clear();
      handler.next(error);
    } finally {
      _isRefreshing = false;
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  T _parse<T>(
    Response response,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    final data = response.data;
    if (data is Map<String, dynamic>) return fromJson(data);
    throw const ApiException('Unexpected response shape');
  }

  List<T> _parseList<T>(
    Response response,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    final data = response.data;
    if (data is List) {
      return data
          .whereType<Map<String, dynamic>>()
          .map(fromJson)
          .toList();
    }
    // Backend may wrap list in a key like { sessions: [...] }
    if (data is Map<String, dynamic>) {
      final first = data.values.firstWhere(
        (v) => v is List,
        orElse: () => [],
      );
      return (first as List)
          .whereType<Map<String, dynamic>>()
          .map(fromJson)
          .toList();
    }
    return [];
  }

  ApiException _wrap(Object e) {
    if (e is DioException) {
      final msg =
          (e.response?.data is Map ? e.response?.data['message'] : null) ??
              e.message ??
              'Network error';
      return ApiException(msg.toString(), statusCode: e.response?.statusCode);
    }
    return ApiException(e.toString());
  }

  // ─── Auth ───────────────────────────────────────────────────────────────────

  Future<AuthResponse> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) async {
    try {
      final resp = await _dio.post('/auth/register', data: {
        'name': name,
        'email': email,
        'password': password,
        if (phone != null && phone.isNotEmpty) 'phone_number': phone,
      });
      final auth = _parse(resp, AuthResponse.fromJson);
      await saveTokens(auth.accessToken, auth.refreshToken);
      return auth;
    } catch (e) {
      throw _wrap(e);
    }
  }

  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    try {
      final resp = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      final auth = _parse(resp, AuthResponse.fromJson);
      await saveTokens(auth.accessToken, auth.refreshToken);
      return auth;
    } catch (e) {
      throw _wrap(e);
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post('/auth/logout');
    } catch (_) {
      // Best effort
    } finally {
      await clearTokens();
    }
  }

  // ─── User ───────────────────────────────────────────────────────────────────

  Future<User> getMe() async {
    try {
      final resp = await _dio.get('/users/me');
      return _parse(resp, User.fromJson);
    } catch (e) {
      throw _wrap(e);
    }
  }

  Future<User> updateMe({required String name, String? phone}) async {
    try {
      final resp = await _dio.put('/users/me', data: {
        'name': name,
        if (phone != null) 'phone_number': phone,
      });
      return _parse(resp, User.fromJson);
    } catch (e) {
      throw _wrap(e);
    }
  }

  // ─── Vehicles ───────────────────────────────────────────────────────────────

  Future<List<Vehicle>> getVehicles() async {
    try {
      final resp = await _dio.get('/vehicles');
      return _parseList(resp, Vehicle.fromJson);
    } catch (e) {
      throw _wrap(e);
    }
  }

  Future<Vehicle> addVehicle({
    required String licensePlate,
    required String vehicleType,
    String? make,
    String? model,
    String? color,
  }) async {
    try {
      final resp = await _dio.post('/vehicles', data: {
        'license_plate': licensePlate,
        'vehicle_type': vehicleType,
        if (make != null) 'make': make,
        if (model != null) 'model': model,
        if (color != null) 'color': color,
      });
      return _parse(resp, Vehicle.fromJson);
    } catch (e) {
      throw _wrap(e);
    }
  }

  Future<void> deleteVehicle(int id) async {
    try {
      await _dio.delete('/vehicles/$id');
    } catch (e) {
      throw _wrap(e);
    }
  }

  // ─── Sessions ───────────────────────────────────────────────────────────────

  Future<ParkingSession?> getActiveSession() async {
    try {
      final resp = await _dio.get('/sessions/active');
      // Backend returns array; take first item for this user.
      final list = _parseList(resp, ParkingSession.fromJson);
      return list.isEmpty ? null : list.first;
    } catch (e) {
      throw _wrap(e);
    }
  }

  Future<List<ParkingSession>> getSessionHistory() async {
    try {
      final resp = await _dio.get('/sessions');
      return _parseList(resp, ParkingSession.fromJson);
    } catch (e) {
      throw _wrap(e);
    }
  }

  Future<ParkingSession> confirmExit(int sessionId, int exitGateId) async {
    try {
      final resp = await _dio.post(
        '/sessions/$sessionId/confirm-exit',
        data: {'exitGateId': exitGateId},
      );
      return _parse(resp, ParkingSession.fromJson);
    } catch (e) {
      throw _wrap(e);
    }
  }

  Future<ParkingSession> confirmParked(int sessionId) async {
    try {
      final resp = await _dio.post('/sessions/$sessionId/confirm-entry');
      return _parse(resp, ParkingSession.fromJson);
    } catch (e) {
      throw _wrap(e);
    }
  }

  // ─── Allocations ────────────────────────────────────────────────────────────

  Future<ParkingSession> allocate({
    required String licensePlate,
    int? entryGateId,
    String? qrCode,
  }) async {
    try {
      final resp = await _dio.post('/allocations', data: {
        'licensePlate': licensePlate,
        if (entryGateId != null) 'entryGateId': entryGateId,
        if (qrCode != null) 'qrCode': qrCode,
      });
      if (resp.data is Map && resp.data['success'] == false) {
        throw ApiException(resp.data['reason']?.toString() ?? 'Allocation failed');
      }
      return _parse(resp, ParkingSession.fromJson);
    } catch (e) {
      throw _wrap(e);
    }
  }

  Future<PlateDetection> scanEntry({required int gateId, String? forcePlate}) async {
    try {
      final resp = await _dio.post('/gates/$gateId/scan-entry', data: {
        if (forcePlate != null) 'forcePlate': forcePlate,
      });
      return _parse(resp, PlateDetection.fromJson);
    } catch (e) {
      throw _wrap(e);
    }
  }

  Future<ParkingSession> confirmEntry({
    required int gateId,
    required String licensePlate,
  }) async {
    try {
      final resp = await _dio.post('/gates/$gateId/confirm-entry', data: {
        'licensePlate': licensePlate,
      });
      if (resp.data is Map && resp.data['success'] == false) {
        throw ApiException(resp.data['reason']?.toString() ?? 'Allocation failed');
      }
      return _parse(resp, ParkingSession.fromJson);
    } catch (e) {
      throw _wrap(e);
    }
  }

  Future<ParkingSession> scanExit({required int gateId, int? sessionId}) async {
    try {
      final resp = await _dio.post('/gates/$gateId/scan-exit', data: {
        if (sessionId != null) 'sessionId': sessionId,
      });
      return _parse(resp, ParkingSession.fromJson);
    } catch (e) {
      throw _wrap(e);
    }
  }
}

class PlateDetection {
  final String licensePlate;
  final double confidence;
  final int? gateId;

  const PlateDetection({
    required this.licensePlate,
    required this.confidence,
    this.gateId,
  });

  factory PlateDetection.fromJson(Map<String, dynamic> json) {
    return PlateDetection(
      licensePlate: (json['licensePlate'] ?? json['license_plate'] ?? '').toString(),
      confidence: double.tryParse((json['confidence'] ?? 0).toString()) ?? 0,
      gateId: json['gate_id'] is int ? json['gate_id'] as int : int.tryParse('${json['gate_id'] ?? ''}'),
    );
  }
}
