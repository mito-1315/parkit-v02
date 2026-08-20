// ignore_for_file: avoid_web_libraries_in_flutter

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:smart_parking_app/models/user.dart';
import 'package:smart_parking_app/providers/auth_provider.dart';
import 'package:smart_parking_app/screens/login_screen.dart';
import 'package:smart_parking_app/services/api_client.dart';

// ─── Mock ApiClient ──────────────────────────────────────────────────────────

class MockApiClient extends Mock implements ApiClient {
  @override
  bool get isLoggedIn => false;

  @override
  String? get accessToken => null;

  @override
  String? get refreshToken => null;
}

// ─── Fake SharedPreferences helper ──────────────────────────────────────────

Future<SharedPreferences> _fakePrefs() async {
  SharedPreferences.setMockInitialValues({});
  return SharedPreferences.getInstance();
}

// ─── Helper: pump login screen ───────────────────────────────────────────────

Future<void> pumpLoginScreen(
  WidgetTester tester,
  MockApiClient mockApi,
) async {
  final prefs = await _fakePrefs();
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        sharedPreferencesProvider.overrideWithValue(prefs),
        apiClientProvider.overrideWithValue(mockApi),
      ],
      child: const MaterialApp(
        home: LoginScreen(),
      ),
    ),
  );
}

void main() {
  late MockApiClient mockApi;

  setUp(() {
    mockApi = MockApiClient();
    registerFallbackValue(AuthResponse(
      accessToken: 'at',
      refreshToken: 'rt',
    ));
  });

  testWidgets('Login screen renders email and password fields',
      (tester) async {
    await pumpLoginScreen(tester, mockApi);
    expect(find.byKey(const Key('login_email_field')), findsOneWidget);
    expect(find.byKey(const Key('login_password_field')), findsOneWidget);
    expect(find.byKey(const Key('login_submit_button')), findsOneWidget);
    expect(find.text('Parker'), findsOneWidget);
  });

  testWidgets('Login: empty fields show validation errors', (tester) async {
    await pumpLoginScreen(tester, mockApi);
    await tester.tap(find.byKey(const Key('login_submit_button')));
    await tester.pump();
    expect(find.text('Email is required'), findsOneWidget);
    expect(find.text('Password is required'), findsOneWidget);
  });

  testWidgets('Login: invalid credentials shows error SnackBar',
      (tester) async {
    when(() => mockApi.login(
          email: any(named: 'email'),
          password: any(named: 'password'),
        )).thenThrow(const ApiException('Invalid credentials', statusCode: 401));
    when(() => mockApi.isLoggedIn).thenReturn(false);
    when(() => mockApi.accessToken).thenReturn(null);

    await pumpLoginScreen(tester, mockApi);

    await tester.enterText(
        find.byKey(const Key('login_email_field')), 'bad@email.com');
    await tester.enterText(
        find.byKey(const Key('login_password_field')), 'wrongpass');
    await tester.tap(find.byKey(const Key('login_submit_button')));
    await tester.pump(); // trigger async
    await tester.pump(const Duration(seconds: 1));

    expect(find.byType(SnackBar), findsOneWidget);
  });

  testWidgets('Login: valid credentials calls api.login', (tester) async {
    when(() => mockApi.login(
          email: 'user@test.com',
          password: 'password123',
        )).thenAnswer((_) async => AuthResponse(
          accessToken: 'access',
          refreshToken: 'refresh',
        ));
    when(() => mockApi.getMe()).thenAnswer(
      (_) async => const User(id: 1, name: 'Test User', email: 'user@test.com'),
    );
    when(() => mockApi.saveTokens(any(), any())).thenAnswer((_) async {});
    when(() => mockApi.isLoggedIn).thenReturn(true);

    await pumpLoginScreen(tester, mockApi);

    await tester.enterText(
        find.byKey(const Key('login_email_field')), 'user@test.com');
    await tester.enterText(
        find.byKey(const Key('login_password_field')), 'password123');
    await tester.tap(find.byKey(const Key('login_submit_button')));
    await tester.pump();

    verify(() => mockApi.login(
          email: 'user@test.com',
          password: 'password123',
        )).called(1);
  });
}
