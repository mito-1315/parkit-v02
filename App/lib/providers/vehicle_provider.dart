import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/vehicle.dart';
import '../services/api_client.dart';
import 'auth_provider.dart';

// ─── Read-only list (FutureProvider) ────────────────────────────────────────

final vehiclesProvider = FutureProvider<List<Vehicle>>((ref) async {
  final api = ref.watch(apiClientProvider);
  return api.getVehicles();
});

// ─── Mutable notifier ────────────────────────────────────────────────────────

class VehicleNotifier extends StateNotifier<AsyncValue<List<Vehicle>>> {
  VehicleNotifier(this._api) : super(const AsyncValue.loading()) {
    _load();
  }

  final ApiClient _api;

  Future<void> _load() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _api.getVehicles());
  }

  Future<void> refresh() => _load();

  Future<void> addVehicle({
    required String licensePlate,
    required String vehicleType,
    String? make,
    String? model,
    String? color,
  }) async {
    final vehicle = await _api.addVehicle(
      licensePlate: licensePlate,
      vehicleType: vehicleType,
      make: make,
      model: model,
      color: color,
    );
    state.whenData((list) {
      state = AsyncValue.data([...list, vehicle]);
    });
  }

  Future<void> deleteVehicle(int id) async {
    await _api.deleteVehicle(id);
    state.whenData((list) {
      state = AsyncValue.data(list.where((v) => v.id != id).toList());
    });
  }
}

final vehicleNotifierProvider =
    StateNotifierProvider<VehicleNotifier, AsyncValue<List<Vehicle>>>((ref) {
  final api = ref.watch(apiClientProvider);
  return VehicleNotifier(api);
});
