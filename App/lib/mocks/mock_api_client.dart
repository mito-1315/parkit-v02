import '../models/parking_session.dart';
import '../models/slot.dart';
import '../models/user.dart';
import '../models/vehicle.dart';
import '../services/api_client.dart';

/// In-memory Parker API used by `--dart-define=USE_MOCK_API=true` builds
/// and by widget tests that want the real fee formula without a backend.
class MockApiClient implements ApiClient {
  MockApiClient();

  static const hourlyRate = 40.0;
  static const gracePeriodMinutes = 15;
  static const minimumFee = 20.0;
  static const currency = 'INR';

  ParkingSession? _active;
  final List<ParkingSession> _history = [];
  String? _access;
  String? _refresh;

  static double calculateFee(int durationMinutes) {
    final billable = durationMinutes - gracePeriodMinutes;
    final billedMinutes = billable < 0 ? 0 : billable;
    final hours = billedMinutes == 0 ? 0 : ((billedMinutes + 59) ~/ 60);
    final raw = hours * hourlyRate;
    return raw > minimumFee ? raw : minimumFee;
  }

  @override
  String? get accessToken => _access;

  @override
  String? get refreshToken => _refresh;

  @override
  bool get isLoggedIn => _access != null;

  @override
  Future<void> saveTokens(String access, String refresh) async {
    _access = access;
    _refresh = refresh;
  }

  @override
  Future<void> clearTokens() async {
    _access = null;
    _refresh = null;
  }

  @override
  Future<AuthResponse> login({required String email, required String password}) async {
    await saveTokens('mock-access', 'mock-refresh');
    return const AuthResponse(accessToken: 'mock-access', refreshToken: 'mock-refresh');
  }

  @override
  Future<AuthResponse> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) =>
      login(email: email, password: password);

  @override
  Future<void> logout() => clearTokens();

  @override
  Future<User> getMe() async => const User(id: 1, name: 'Demo Parker', email: 'user1@example.com');

  @override
  Future<User> updateMe({required String name, String? phone}) async =>
      User(id: 1, name: name, email: 'user1@example.com', phoneNumber: phone);

  @override
  Future<List<Vehicle>> getVehicles() async => const [
        Vehicle(id: 1, licensePlate: 'MH12AB1234', vehicleType: 'CAR', userId: 1),
      ];

  @override
  Future<Vehicle> addVehicle({
    required String licensePlate,
    required String vehicleType,
    String? make,
    String? model,
    String? color,
  }) async {
    return Vehicle(id: 2, licensePlate: licensePlate, vehicleType: vehicleType, userId: 1, make: make, model: model, color: color);
  }

  @override
  Future<void> deleteVehicle(int id) async {}

  @override
  Future<ParkingSession?> getActiveSession() async => _active;

  @override
  Future<List<ParkingSession>> getSessionHistory() async => _history;

  @override
  Future<PlateDetection> scanEntry({required int gateId, String? forcePlate}) async {
    return PlateDetection(licensePlate: forcePlate ?? 'MH12AB1234', confidence: 0.91, gateId: gateId);
  }

  @override
  Future<ParkingSession> confirmEntry({required int gateId, required String licensePlate}) async {
    _active = ParkingSession(
      id: 101,
      status: SessionStatus.reserved,
      slotId: 7,
      vehicleId: 1,
      entryGateId: gateId,
      entryTime: DateTime.now(),
      facilityName: 'Central Plaza Parking',
      slot: const Slot(id: 7, label: 'A-07', floor: 1, status: 'RESERVED', zoneId: 1, zone: Zone(id: 1, name: 'Ground Floor', facilityId: 1)),
      vehicle: Vehicle(id: 1, licensePlate: licensePlate, vehicleType: 'CAR', userId: 1),
    );
    return _active!;
  }

  @override
  Future<ParkingSession> scanExit({required int gateId, int? sessionId}) async {
    final start = _active?.entryTime ?? DateTime.now().subtract(const Duration(minutes: 95));
    final duration = DateTime.now().difference(start).inMinutes;
    final fee = calculateFee(duration);
    final completed = (_active ??
            ParkingSession(
              id: sessionId ?? 101,
              status: SessionStatus.active,
              entryTime: start,
              vehicle: const Vehicle(id: 1, licensePlate: 'MH12AB1234', vehicleType: 'CAR', userId: 1),
            ))
        .copyWith(
          status: SessionStatus.completed,
          exitTime: DateTime.now(),
          parkingFee: fee,
          paymentStatus: 'PENDING',
          durationMinutes: duration,
          currency: currency,
        );
    _history.insert(0, completed);
    _active = null;
    return completed;
  }

  @override
  Future<ParkingSession> confirmParked(int sessionId) async {
    _active = _active?.copyWith(status: SessionStatus.active) ?? _active;
    return _active!;
  }

  @override
  Future<ParkingSession> confirmExit(int sessionId, int exitGateId) {
    return scanExit(gateId: exitGateId, sessionId: sessionId);
  }

  @override
  Future<ParkingSession> allocate({
    required String licensePlate,
    int? entryGateId,
    String? qrCode,
  }) {
    return confirmEntry(gateId: entryGateId ?? 1, licensePlate: licensePlate);
  }
}
