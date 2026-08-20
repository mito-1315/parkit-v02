import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:smart_parking_app/models/parking_session.dart';
import 'package:smart_parking_app/models/slot.dart';
import 'package:smart_parking_app/providers/auth_provider.dart';
import 'package:smart_parking_app/providers/session_provider.dart';
import 'package:smart_parking_app/screens/history_screen.dart';
import 'package:smart_parking_app/services/api_client.dart';

class MockApiClient extends Mock implements ApiClient {
  @override
  bool get isLoggedIn => true;

  @override
  String? get accessToken => 'token';

  @override
  String? get refreshToken => 'refresh';
}

void main() {
  late MockApiClient mockApi;

  setUp(() {
    SharedPreferences.setMockInitialValues({});
    mockApi = MockApiClient();
  });

  testWidgets('History: displays empty state when no history',
      (tester) async {
    final prefs = await SharedPreferences.getInstance();
    when(() => mockApi.getSessionHistory()).thenAnswer((_) async => []);

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
          apiClientProvider.overrideWithValue(mockApi),
        ],
        child: const MaterialApp(home: HistoryScreen()),
      ),
    );

    await tester.pump();
    expect(find.text('No history yet'), findsOneWidget);
  });

  testWidgets('History: lists completed sessions', (tester) async {
    final prefs = await SharedPreferences.getInstance();
    
    final sessions = [
      ParkingSession(
        id: 1,
        status: SessionStatus.completed,
        entryTime: DateTime(2025, 1, 1, 10, 0),
        exitTime: DateTime(2025, 1, 1, 12, 30),
        facilityName: 'Mall A',
        slot: Slot(
          id: 1,
          label: 'A1',
          status: 'AVAILABLE',
          zoneId: 1,
          zone: Zone(id: 1, name: 'Zone 1', facilityId: 1),
        ),
      ),
      ParkingSession(
        id: 2,
        status: SessionStatus.completed,
        entryTime: DateTime(2025, 1, 2, 14, 0),
        exitTime: DateTime(2025, 1, 2, 14, 45),
        facilityName: 'Mall B',
        slot: Slot(
          id: 2,
          label: 'B2',
          status: 'AVAILABLE',
          zoneId: 2,
          zone: Zone(id: 2, name: 'Zone 2', facilityId: 2),
        ),
      ),
    ];

    when(() => mockApi.getSessionHistory()).thenAnswer((_) async => sessions);

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
          apiClientProvider.overrideWithValue(mockApi),
        ],
        child: const MaterialApp(home: HistoryScreen()),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('Mall A'), findsOneWidget);
    expect(find.text('Slot A1'), findsOneWidget);
    expect(find.text('2h 30m'), findsOneWidget);

    expect(find.text('Mall B'), findsOneWidget);
    expect(find.text('Slot B2'), findsOneWidget);
    expect(find.text('45m'), findsOneWidget);
  });
}
