import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:smart_parking_app/models/parking_session.dart';
import 'package:smart_parking_app/models/user.dart';
import 'package:smart_parking_app/providers/auth_provider.dart';
import 'package:smart_parking_app/providers/session_provider.dart';
import 'package:smart_parking_app/providers/socket_provider.dart';
import 'package:smart_parking_app/screens/home_screen.dart';
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

Future<SharedPreferences> _fakePrefs() async {
  SharedPreferences.setMockInitialValues({});
  return SharedPreferences.getInstance();
}

<<<<<<< HEAD
// Removed unused helper `_wrapWithProviders` to silence unused_element diagnostic.
=======
Widget _wrapWithProviders({
  required Widget child,
  required MockApiClient mockApi,
  ParkingSession? activeSession,
}) {
  return ProviderScope(
    overrides: [
      sharedPreferencesProvider.overrideWithValue(
          SharedPreferences.getInstance() as SharedPreferences),
      apiClientProvider.overrideWithValue(mockApi),
      socketServiceProvider.overrideWithValue(MockSocketService()),
      authProvider.overrideWith((ref) {
        final notifier = AuthNotifier(mockApi);
        notifier.state = AsyncValue.data(
          const User(id: 1, name: 'Test User', email: 'test@test.com'),
        );
        return notifier;
      }),
      activeSessionProvider.overrideWith((ref) {
        final notifier = SessionNotifier(mockApi, ref);
        notifier.state = AsyncValue.data(activeSession);
        return notifier;
      }),
    ],
    child: MaterialApp(home: child),
  );
}
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d

void main() {
  late MockApiClient mockApi;
  late MockSocketService mockSocket;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    mockApi = MockApiClient();
    mockSocket = MockSocketService();
    when(() => mockApi.getActiveSession()).thenAnswer((_) async => null);
    when(() => mockApi.getVehicles()).thenAnswer((_) async => []);
    when(() => mockSocket.updates)
        .thenAnswer((_) => const Stream.empty());
  });

  testWidgets('Home: shows "Not Parked" when no active session',
      (tester) async {
    final prefs = await _fakePrefs();
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
          apiClientProvider.overrideWithValue(mockApi),
          socketServiceProvider.overrideWithValue(mockSocket),
          authProvider.overrideWith((ref) {
            final n = AuthNotifier(mockApi);
<<<<<<< HEAD
            n.state = const AsyncValue.data(
              User(id: 1, name: 'Test', email: 't@t.com'),
=======
            n.state = AsyncValue.data(
              const User(id: 1, name: 'Test', email: 't@t.com'),
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
            );
            return n;
          }),
          activeSessionProvider.overrideWith((ref) {
            final n = SessionNotifier(mockApi, ref);
            n.state = const AsyncValue.data(null);
            return n;
          }),
        ],
        child: const MaterialApp(home: HomeScreen()),
      ),
    );
    await tester.pump();
    expect(find.text('Not Parked'), findsOneWidget);
    expect(find.byKey(const Key('scan_gate_button')), findsOneWidget);
  });

  testWidgets('Home: shows session card when active session exists',
      (tester) async {
    final prefs = await _fakePrefs();
    final session = ParkingSession(
      id: 42,
      status: SessionStatus.active,
      entryTime: DateTime.now().subtract(const Duration(minutes: 30)),
      facilityName: 'City Center Parking',
    );

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
          apiClientProvider.overrideWithValue(mockApi),
          socketServiceProvider.overrideWithValue(mockSocket),
          authProvider.overrideWith((ref) {
            final n = AuthNotifier(mockApi);
<<<<<<< HEAD
            n.state = const AsyncValue.data(
              User(id: 1, name: 'Test', email: 't@t.com'),
=======
            n.state = AsyncValue.data(
              const User(id: 1, name: 'Test', email: 't@t.com'),
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
            );
            return n;
          }),
          activeSessionProvider.overrideWith((ref) {
            final n = SessionNotifier(mockApi, ref);
            n.state = AsyncValue.data(session);
            return n;
          }),
        ],
        child: const MaterialApp(home: HomeScreen()),
      ),
    );
    await tester.pump();
    expect(find.text('City Center Parking'), findsOneWidget);
    expect(find.text('Active'), findsOneWidget);
  });
}
