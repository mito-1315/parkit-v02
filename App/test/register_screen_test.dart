import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:smart_parking_app/models/user.dart';
import 'package:smart_parking_app/providers/auth_provider.dart';
import 'package:smart_parking_app/screens/register_screen.dart';
import 'package:smart_parking_app/services/api_client.dart';

class MockApiClient extends Mock implements ApiClient {
  @override
  bool get isLoggedIn => false;

  @override
  String? get accessToken => null;

  @override
  String? get refreshToken => null;
}

Future<SharedPreferences> _fakePrefs() async {
  SharedPreferences.setMockInitialValues({});
  return SharedPreferences.getInstance();
}

void main() {
  late MockApiClient mockApi;

  setUp(() {
    mockApi = MockApiClient();
<<<<<<< HEAD
    registerFallbackValue(const AuthResponse(
=======
    registerFallbackValue(AuthResponse(
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
      accessToken: 'at',
      refreshToken: 'rt',
    ));
  });

  Future<void> pump(WidgetTester tester) async {
    final prefs = await _fakePrefs();
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
          apiClientProvider.overrideWithValue(mockApi),
        ],
        child: const MaterialApp(home: RegisterScreen()),
      ),
    );
  }

  testWidgets('Register screen renders all required fields', (tester) async {
    await pump(tester);
    expect(find.byKey(const Key('register_name_field')), findsOneWidget);
    expect(find.byKey(const Key('register_email_field')), findsOneWidget);
    expect(find.byKey(const Key('register_password_field')), findsOneWidget);
    expect(find.byKey(const Key('register_phone_field')), findsOneWidget);
    expect(find.byKey(const Key('register_submit_button')), findsOneWidget);
  });

  testWidgets('Register: submitting valid data calls api.register',
      (tester) async {
    when(() => mockApi.register(
          name: any(named: 'name'),
          email: any(named: 'email'),
          password: any(named: 'password'),
          phone: any(named: 'phone'),
<<<<<<< HEAD
        )).thenAnswer((_) async => const AuthResponse(
=======
        )).thenAnswer((_) async => AuthResponse(
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
          accessToken: 'access',
          refreshToken: 'refresh',
        ));
    when(() => mockApi.getMe()).thenAnswer(
      (_) async => const User(id: 1, name: 'Alice', email: 'alice@test.com'),
    );
    when(() => mockApi.saveTokens(any(), any())).thenAnswer((_) async {});
    when(() => mockApi.isLoggedIn).thenReturn(true);

    await pump(tester);

    await tester.enterText(
        find.byKey(const Key('register_name_field')), 'Alice');
    await tester.enterText(
        find.byKey(const Key('register_email_field')), 'alice@test.com');
    await tester.enterText(
        find.byKey(const Key('register_password_field')), 'password123');
    await tester.tap(find.byKey(const Key('register_submit_button')));
    await tester.pump();

    verify(() => mockApi.register(
          name: 'Alice',
          email: 'alice@test.com',
          password: 'password123',
          phone: null,
        )).called(1);
  });

  testWidgets('Register: short password shows validation error',
      (tester) async {
    await pump(tester);
    await tester.enterText(
        find.byKey(const Key('register_name_field')), 'Bob');
    await tester.enterText(
        find.byKey(const Key('register_email_field')), 'bob@test.com');
    await tester.enterText(
        find.byKey(const Key('register_password_field')), '123');
    await tester.tap(find.byKey(const Key('register_submit_button')));
    await tester.pump();
    expect(find.text('Minimum 6 characters'), findsOneWidget);
  });
}
