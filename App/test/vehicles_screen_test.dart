import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:smart_parking_app/models/vehicle.dart';
import 'package:smart_parking_app/providers/auth_provider.dart';
import 'package:smart_parking_app/providers/vehicle_provider.dart';
import 'package:smart_parking_app/screens/vehicles_screen.dart';
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

  final testVehicles = [
    const Vehicle(
      id: 1,
      licensePlate: 'TN01AB1234',
      vehicleType: 'CAR',
      make: 'Toyota',
      model: 'Camry',
      color: 'Silver',
      userId: 1,
    ),
    const Vehicle(
      id: 2,
      licensePlate: 'MH02CD5678',
      vehicleType: 'MOTORCYCLE',
      userId: 1,
    ),
  ];

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    mockApi = MockApiClient();
  });

  Future<ProviderContainer> buildWidget(WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    final container = ProviderContainer(
      overrides: [
        sharedPreferencesProvider.overrideWithValue(prefs),
        apiClientProvider.overrideWithValue(mockApi),
        vehicleNotifierProvider.overrideWith((ref) {
          final n = VehicleNotifier(mockApi);
          n.state = AsyncValue.data(testVehicles);
          return n;
        }),
      ],
    );

    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: const MaterialApp(home: VehiclesScreen()),
      ),
    );
    return container;
  }

  testWidgets('Vehicles: lists registered vehicles', (tester) async {
    await buildWidget(tester);
    await tester.pump();

    expect(find.text('TN01AB1234'), findsOneWidget);
    expect(find.text('MH02CD5678'), findsOneWidget);
  });

  testWidgets('Vehicles: delete button calls deleteVehicle', (tester) async {
    when(() => mockApi.deleteVehicle(any()))
        .thenAnswer((_) async {});

    await buildWidget(tester);
    await tester.pump();

    // Tap delete icon for first vehicle
    final deleteIcons = find.byIcon(Icons.delete_outline_rounded);
    expect(deleteIcons, findsWidgets);
    await tester.tap(deleteIcons.first);
    await tester.pumpAndSettle();

    // Confirm in dialog
    await tester.tap(find.byKey(const Key('delete_vehicle_confirm')));
    await tester.pump();

    verify(() => mockApi.deleteVehicle(any())).called(1);
  });

  testWidgets('Vehicles: FAB shows Add Vehicle sheet', (tester) async {
    await buildWidget(tester);
    await tester.pump();

    await tester.tap(find.byKey(const Key('add_vehicle_fab')));
    await tester.pumpAndSettle();

    expect(find.text('Add Vehicle'), findsWidgets);
    expect(find.byKey(const Key('vehicle_plate_field')), findsOneWidget);
  });
}
