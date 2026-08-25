import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/user.dart';
import '../mocks/mock_api_client.dart';
import '../services/api_client.dart';

// ─── SharedPreferences provider ─────────────────────────────────────────────

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('Override in ProviderScope');
});

// ─── ApiClient provider ──────────────────────────────────────────────────────

const bool kUseMockApi = bool.fromEnvironment('USE_MOCK_API');

final apiClientProvider = Provider<ApiClient>((ref) {
  if (kUseMockApi) return MockApiClient();
  final prefs = ref.watch(sharedPreferencesProvider);
  return ApiClient(prefs);
});

// ─── Auth notifier ───────────────────────────────────────────────────────────

class AuthNotifier extends StateNotifier<AsyncValue<User?>> {
  AuthNotifier(this._api) : super(const AsyncValue.data(null));

  final ApiClient _api;

  Future<void> restore() async {
    if (!_api.isLoggedIn) {
      state = const AsyncValue.data(null);
      return;
    }
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _api.getMe());
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    state = const AsyncValue.loading();
    try {
      await _api.login(email: email, password: password);
      final user = await _api.getMe();
      state = AsyncValue.data(user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) async {
    state = const AsyncValue.loading();
    try {
      await _api.register(
        name: name,
        email: email,
        password: password,
        phone: phone,
      );
      final user = await _api.getMe();
      state = AsyncValue.data(user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> logout() async {
    await _api.logout();
    state = const AsyncValue.data(null);
  }

  Future<void> updateProfile({required String name, String? phone}) async {
    final user = await _api.updateMe(name: name, phone: phone);
    state = AsyncValue.data(user);
  }
}

final authProvider =
    StateNotifierProvider<AuthNotifier, AsyncValue<User?>>((ref) {
  final api = ref.watch(apiClientProvider);
  return AuthNotifier(api);
});
