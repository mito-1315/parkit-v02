import '../utils/json.dart';

class Vehicle {
  final int id;
  final String licensePlate;
  final String vehicleType;
  final String? make;
  final String? model;
  final String? color;
  final int userId;

  const Vehicle({
    required this.id,
    required this.licensePlate,
    required this.vehicleType,
    this.make,
    this.model,
    this.color,
    required this.userId,
  });

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    return Vehicle(
      id: jsonInt(json, ['vehicle_id', 'id']),
      licensePlate: jsonStr(json, ['license_plate']),
      vehicleType: jsonStr(json, ['vehicle_type'], fallback: 'CAR'),
      make: jsonStrOrNull(json, ['make']),
      model: jsonStrOrNull(json, ['model']),
      color: jsonStrOrNull(json, ['color']),
      userId: jsonInt(json, ['user_id'], fallback: 0),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'license_plate': licensePlate,
        'vehicle_type': vehicleType,
        'make': make,
        'model': model,
        'color': color,
        'user_id': userId,
      };

  String get displayName {
    final parts = [if (make != null) make!, if (model != null) model!];
    final desc = parts.isEmpty ? vehicleType : parts.join(' ');
    return '$desc · $licensePlate';
  }
}
