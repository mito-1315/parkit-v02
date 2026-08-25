import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/vehicle.dart';
import '../providers/vehicle_provider.dart';
import '../theme.dart';
import '../widgets/gradient_button.dart';
import '../widgets/vehicle_tile.dart';

class VehiclesScreen extends ConsumerWidget {
  const VehiclesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final vehicleState = ref.watch(vehicleNotifierProvider);

    return Scaffold(
      backgroundColor: Pk.bg,
      appBar: AppBar(
        backgroundColor: Pk.bg,
        title: const Text('My Vehicles'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        elevation: 0,
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(color: Pk.border, height: 1),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        key: const Key('add_vehicle_fab'),
        backgroundColor: Pk.primary,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text(
          'Add Vehicle',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
        onPressed: () => _showAddSheet(context, ref),
      ),
      body: vehicleState.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: Pk.primary, strokeWidth: 2),
        ),
        error: (e, _) => Center(
          child: Text(
            'Failed to load vehicles\n$e',
            style: const TextStyle(color: Color(0xFFF87171)),
            textAlign: TextAlign.center,
          ),
        ),
        data: (vehicles) => vehicles.isEmpty
            ? const _EmptyState()
            : ListView.builder(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 100),
                itemCount: vehicles.length,
                itemBuilder: (_, i) => VehicleTile(
                  key: ValueKey(vehicles[i].id),
                  vehicle: vehicles[i],
                  onDelete: () => _confirmDelete(context, ref, vehicles[i]),
                ),
              ),
      ),
    );
  }

  void _confirmDelete(
      BuildContext context, WidgetRef ref, Vehicle vehicle) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF1A1A2E),
        title: const Text('Remove Vehicle',
            style: TextStyle(color: Colors.white)),
        content: Text(
          'Remove ${vehicle.licensePlate} from your vehicles?',
          style: const TextStyle(color: Color(0xFF94A3B8)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel',
                style: TextStyle(color: Color(0xFF64748B))),
          ),
          TextButton(
            key: const Key('delete_vehicle_confirm'),
            onPressed: () async {
              Navigator.pop(context);
              await ref
                  .read(vehicleNotifierProvider.notifier)
                  .deleteVehicle(vehicle.id);
            },
            child: const Text('Remove',
                style: TextStyle(color: Color(0xFFF87171))),
          ),
        ],
      ),
    );
  }

  void _showAddSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _AddVehicleSheet(ref: ref),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 72,
            height: 72,
              decoration: BoxDecoration(
              color: const Color(0xFF6366F1).withAlpha((0.1 * 255).round()),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.directions_car_outlined,
                color: Color(0xFF6366F1), size: 36),
          ),
          const SizedBox(height: 16),
          const Text(
            'No vehicles yet',
            style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 6),
          const Text(
            'Tap + Add Vehicle to register your car',
            style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
          ),
        ],
      ),
    );
  }
}

class _AddVehicleSheet extends ConsumerStatefulWidget {
  final WidgetRef ref;
  const _AddVehicleSheet({required this.ref});

  @override
  ConsumerState<_AddVehicleSheet> createState() => _AddVehicleSheetState();
}

class _AddVehicleSheetState extends ConsumerState<_AddVehicleSheet> {
  final _formKey = GlobalKey<FormState>();
  final _plateCtrl = TextEditingController();
  final _makeCtrl = TextEditingController();
  final _modelCtrl = TextEditingController();
  final _colorCtrl = TextEditingController();
  String _vehicleType = 'CAR';
  bool _loading = false;

  static const _types = ['CAR', 'MOTORCYCLE', 'TRUCK', 'BUS'];

  @override
  void dispose() {
    _plateCtrl.dispose();
    _makeCtrl.dispose();
    _modelCtrl.dispose();
    _colorCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      await ref.read(vehicleNotifierProvider.notifier).addVehicle(
            licensePlate: _plateCtrl.text.trim().toUpperCase(),
            vehicleType: _vehicleType,
            make: _makeCtrl.text.trim().isEmpty ? null : _makeCtrl.text.trim(),
            model:
                _modelCtrl.text.trim().isEmpty ? null : _modelCtrl.text.trim(),
            color: _colorCtrl.text.trim().isEmpty
                ? null
                : _colorCtrl.text.trim(),
          );
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString()),
          backgroundColor: const Color(0xFFF87171),
        ),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.of(context).viewInsets.bottom;
    return Container(
      padding: EdgeInsets.fromLTRB(24, 24, 24, 24 + bottom),
      decoration: const BoxDecoration(
        color: Color(0xFF111827),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.white.withAlpha((0.15 * 255).round()),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Add Vehicle',
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 20),
            // License Plate
            _field(
              key: const Key('vehicle_plate_field'),
              controller: _plateCtrl,
              hint: 'ABC 1234',
              label: 'License Plate',
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Required' : null,
            ),
            const SizedBox(height: 12),
            // Type dropdown
            DropdownButtonFormField<String>(
              key: const Key('vehicle_type_dropdown'),
              initialValue: _vehicleType,
              dropdownColor: const Color(0xFF1A1A2E),
              style: const TextStyle(color: Colors.white),
              decoration: _deco('Vehicle Type'),
              items: _types
                  .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                  .toList(),
              onChanged: (v) => setState(() => _vehicleType = v!),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _field(
                    key: const Key('vehicle_make_field'),
                    controller: _makeCtrl,
                    hint: 'Toyota',
                    label: 'Make',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _field(
                    key: const Key('vehicle_model_field'),
                    controller: _modelCtrl,
                    hint: 'Camry',
                    label: 'Model',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _field(
              key: const Key('vehicle_color_field'),
              controller: _colorCtrl,
              hint: 'Silver',
              label: 'Color',
            ),
            const SizedBox(height: 24),
            GradientButton(
              key: const Key('add_vehicle_submit'),
              label: 'Add Vehicle',
              loading: _loading,
              onPressed: _loading ? null : _submit,
            ),
          ],
        ),
      ),
    );
  }

  Widget _field({
    Key? key,
    required TextEditingController controller,
    required String hint,
    required String label,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      key: key,
      controller: controller,
      style: const TextStyle(color: Colors.white),
      decoration: _deco(hint).copyWith(labelText: label),
      validator: validator,
    );
  }

  InputDecoration _deco(String hint) => InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Color(0xFF475569)),
        filled: true,
        fillColor: const Color(0xFF1A1A2E),
        labelStyle: const TextStyle(color: Color(0xFF64748B)),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border:
            OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
          enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: Colors.white.withAlpha((0.08 * 255).round())),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide:
              const BorderSide(color: Color(0xFF6366F1), width: 1.5),
        ),
      );
}
