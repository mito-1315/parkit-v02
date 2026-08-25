import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:smart_parking_app/models/parking_session.dart';
import 'package:smart_parking_app/models/slot.dart';
import 'package:smart_parking_app/models/vehicle.dart';
import 'package:smart_parking_app/providers/auth_provider.dart';
import 'package:smart_parking_app/providers/session_provider.dart';
import 'package:smart_parking_app/providers/socket_provider.dart';
import 'package:smart_parking_app/providers/vehicle_provider.dart';
import 'package:smart_parking_app/screens/slot_allocated_screen.dart';
import 'package:smart_parking_app/services/api_client.dart';
import 'package:smart_parking_app/services/socket_service.dart';

class MockApiClient extends Mock implements ApiClient {
  @override
  bool get isLoggedIn => true;

  @override
  String? get accessToken => 'token';

  @override
  String? get refreshToken => 'refresh';
}

class MockSocketService extends Mock implements SocketService {}

void main() {
  late MockApiClient mockApi;
  late MockSocketService mockSocket;

  setUp(() {
    SharedPreferences.setMockInitialValues({});
    mockApi = MockApiClient();
    mockSocket = MockSocketService();
    when(() => mockSocket.updates).thenAnswer((_) => const Stream.empty());
  });

  /// Creates an allocated session used in the scan → allocated flow test.
<<<<<<< HEAD
  ParkingSession allocatedSession() {
=======
  ParkingSession _allocatedSession() {
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
    return ParkingSession(
      id: 99,
      status: SessionStatus.reserved,
      slotId: 5,
      vehicleId: 1,
      entryGateId: 1,
      entryTime: DateTime.now(),
      facilityName: 'Test Mall Parking',
<<<<<<< HEAD
      slot: const Slot(
=======
      slot: Slot(
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
        id: 5,
        label: 'A-07',
        floor: 2,
        status: 'OCCUPIED',
        zoneId: 1,
        zone: Zone(id: 1, name: 'Zone A', facilityId: 1),
      ),
      vehicle: const Vehicle(
        id: 1,
        licensePlate: 'TN01AB1234',
        vehicleType: 'CAR',
        userId: 1,
      ),
    );
  }

  testWidgets(
      'SlotAllocated: shows allocated slot info from active session',
      (tester) async {
    final prefs = await SharedPreferences.getInstance();
<<<<<<< HEAD
    final session = allocatedSession();
=======
    final session = _allocatedSession();
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
          apiClientProvider.overrideWithValue(mockApi),
          socketServiceProvider.overrideWithValue(mockSocket),
          vehicleNotifierProvider.overrideWith((ref) {
            final n = VehicleNotifier(mockApi);
            n.state = const AsyncValue.data([]);
            return n;
          }),
          activeSessionProvider.overrideWith((ref) {
            final n = SessionNotifier(mockApi, ref);
            n.state = AsyncValue.data(session);
            return n;
          }),
        ],
        child: const MaterialApp(home: SlotAllocatedScreen()),
      ),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 800)); // animation

    expect(find.text('Slot Allocated!'), findsOneWidget);
    expect(find.text('A-07'), findsOneWidget);
    expect(find.text('Test Mall Parking'), findsOneWidget);
    expect(find.text('Zone A'), findsOneWidget);
    expect(find.byKey(const Key('view_session_button')), findsOneWidget);
  });

  testWidgets('Scan→Allocated flow: faked allocate returns RESERVED session',
      (tester) async {
    final prefs = await SharedPreferences.getInstance();
<<<<<<< HEAD
    final session = allocatedSession();
=======
    final session = _allocatedSession();
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d

    when(() => mockApi.allocate(
          licensePlate: any(named: 'licensePlate'),
          entryGateId: any(named: 'entryGateId'),
        )).thenAnswer((_) async => session);

    // Render SlotAllocatedScreen with the pre-built session already in state.
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
          apiClientProvider.overrideWithValue(mockApi),
          socketServiceProvider.overrideWithValue(mockSocket),
          vehicleNotifierProvider.overrideWith((ref) {
            final n = VehicleNotifier(mockApi);
            n.state = const AsyncValue.data([]);
            return n;
          }),
          activeSessionProvider.overrideWith((ref) {
            final n = SessionNotifier(mockApi, ref);
            n.state = AsyncValue.data(session);
            return n;
          }),
        ],
        child: const MaterialApp(home: SlotAllocatedScreen()),
      ),
    );

    await tester.pump();
    await tester.pump(const Duration(milliseconds: 800));

    // Session data is displayed.
    expect(find.text('A-07'), findsOneWidget);
    expect(find.text('2'), findsOneWidget); // floor
  });
}
