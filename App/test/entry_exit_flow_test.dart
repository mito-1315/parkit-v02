import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:smart_parking_app/mocks/mock_api_client.dart';
import 'package:smart_parking_app/models/parking_session.dart';
import 'package:smart_parking_app/models/slot.dart';
import 'package:smart_parking_app/models/vehicle.dart';
import 'package:smart_parking_app/providers/auth_provider.dart';
import 'package:smart_parking_app/providers/session_provider.dart';
import 'package:smart_parking_app/providers/socket_provider.dart';
import 'package:smart_parking_app/screens/amount_due_screen.dart';
import 'package:smart_parking_app/screens/confirm_vehicle_screen.dart';
import 'package:smart_parking_app/services/api_client.dart';
import 'package:smart_parking_app/services/socket_service.dart';

class MockHttpApi extends Mock implements ApiClient {
  @override
  bool get isLoggedIn => true;

  @override
  String? get accessToken => 'token';

  @override
  String? get refreshToken => 'refresh';
}

class MockSocketService extends Mock implements SocketService {}

void main() {
  late MockHttpApi mockApi;
  late MockSocketService mockSocket;

  setUp(() {
    SharedPreferences.setMockInitialValues({});
    mockApi = MockHttpApi();
    mockSocket = MockSocketService();
    when(() => mockSocket.updates).thenAnswer((_) => const Stream.empty());
  });

  testWidgets('Confirm Vehicle renders detected plate, allows edit, submits edited value',
      (tester) async {
    final prefs = await SharedPreferences.getInstance();
    when(() => mockApi.confirmEntry(
          gateId: any(named: 'gateId'),
          licensePlate: any(named: 'licensePlate'),
        )).thenAnswer((inv) async {
      final plate = inv.namedArguments[#licensePlate] as String;
      return ParkingSession(
        id: 1,
        status: SessionStatus.reserved,
        entryGateId: 1,
        vehicle: Vehicle(id: 1, licensePlate: plate, vehicleType: 'CAR', userId: 1),
        slot: Slot(id: 1, label: 'A-01', status: 'RESERVED', zoneId: 1),
      );
    });

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
          apiClientProvider.overrideWithValue(mockApi),
          socketServiceProvider.overrideWithValue(mockSocket),
          pendingEntryProvider.overrideWith((ref) => const PlateDetection(
                licensePlate: 'MH12AB1234',
                confidence: 0.91,
                gateId: 1,
              )),
          activeSessionProvider.overrideWith((ref) => SessionNotifier(mockApi, ref)),
        ],
        child: const MaterialApp(home: ConfirmVehicleScreen(gateId: 1)),
      ),
    );
    await tester.pump();

    expect(find.text('MH12AB1234'), findsOneWidget);

    await tester.enterText(find.byKey(const Key('plate_field')), 'KA01XY5678');
    await tester.tap(find.byKey(const Key('confirm_vehicle_button')));
    await tester.pump();

    verify(() => mockApi.confirmEntry(gateId: 1, licensePlate: 'KA01XY5678')).called(1);
    verifyNever(() => mockApi.confirmEntry(gateId: 1, licensePlate: 'MH12AB1234'));
  });

  testWidgets('Amount Due renders fee computed by the mock client', (tester) async {
    final prefs = await SharedPreferences.getInstance();
    const durationMinutes = 95; // 95 - 15 grace = 80 min → 2 hours * 40 = 80
    final fee = MockApiClient.calculateFee(durationMinutes);
    expect(fee, 80);

    final session = ParkingSession(
      id: 9,
      status: SessionStatus.completed,
      durationMinutes: durationMinutes,
      parkingFee: fee,
      paymentStatus: 'PENDING',
      currency: 'INR',
      entryTime: DateTime.now().subtract(const Duration(minutes: 95)),
      exitTime: DateTime.now(),
    );

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
          lastCompletedSessionProvider.overrideWith((ref) => session),
        ],
        child: const MaterialApp(home: AmountDueScreen()),
      ),
    );
    await tester.pump();

    expect(find.byKey(const Key('amount_due_value')), findsOneWidget);
    expect(find.text('INR 80.00'), findsOneWidget);
    expect(find.textContaining('PENDING'), findsOneWidget);
  });
}
