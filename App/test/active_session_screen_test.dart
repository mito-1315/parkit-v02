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
import 'package:smart_parking_app/screens/active_session_screen.dart';
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

  ParkingSession activeSession() {
    return ParkingSession(
      id: 100,
      status: SessionStatus.active,
      slotId: 5,
      vehicleId: 1,
      entryGateId: 1,
      entryTime: DateTime.now().subtract(const Duration(minutes: 15, seconds: 30)),
      facilityName: 'Downtown Garage',
      slot: const Slot(
        id: 5,
        label: 'B-12',
        floor: 1,
        status: 'OCCUPIED',
        zoneId: 2,
        zone: Zone(id: 2, name: 'Zone B', facilityId: 1),
      ),
      vehicle: const Vehicle(
        id: 1,
        licensePlate: 'ABC 123',
        vehicleType: 'CAR',
        make: 'Honda',
        model: 'Civic',
        userId: 1,
      ),
    );
  }

  testWidgets('ActiveSession: renders elapsed time and session info',
      (tester) async {
    final prefs = await SharedPreferences.getInstance();
    final session = activeSession();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
          apiClientProvider.overrideWithValue(mockApi),
          socketServiceProvider.overrideWithValue(mockSocket),
          activeSessionProvider.overrideWith((ref) {
            final n = SessionNotifier(mockApi, ref);
            n.state = AsyncValue.data(session);
            return n;
          }),
        ],
        child: const MaterialApp(home: ActiveSessionScreen()),
      ),
    );

    await tester.pump();

    // Facility & Slot info
    expect(find.text('Downtown Garage'), findsOneWidget);
    expect(find.text('B-12'), findsOneWidget);
    expect(find.text('Zone B'), findsOneWidget);
    expect(find.text('1'), findsOneWidget); // floor

    // Vehicle info
    expect(find.text('ABC 123'), findsOneWidget);
    expect(find.text('Honda Civic'), findsOneWidget);

    // Exit now goes through Scan Exit Gate
    expect(find.byKey(const Key('manual_exit_button')), findsOneWidget);
    expect(find.text('Scan Exit Gate'), findsOneWidget);
    
    // Ticker might show something like 00:15:30
    final timerText = tester.widget<Text>(find.byKey(const Key('elapsed_timer')));
    expect(timerText.data, contains(':15:')); 
  });

  testWidgets('ActiveSession: exit CTA is Scan Exit Gate', (tester) async {
    final prefs = await SharedPreferences.getInstance();
    final session = activeSession();

    when(() => mockApi.confirmExit(any(), any()))
        .thenAnswer((_) async => session.copyWith(status: SessionStatus.completed));

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
          apiClientProvider.overrideWithValue(mockApi),
          socketServiceProvider.overrideWithValue(mockSocket),
          activeSessionProvider.overrideWith((ref) {
            final n = SessionNotifier(mockApi, ref);
            n.state = AsyncValue.data(session);
            return n;
          }),
        ],
        child: const MaterialApp(home: ActiveSessionScreen()),
      ),
    );

    await tester.pump();
    expect(find.text('Scan Exit Gate'), findsOneWidget);
    expect(find.text('Confirm Exit'), findsNothing);
  });
}
