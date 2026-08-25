import '../utils/json.dart';
import 'facility.dart';

class Zone {
  final int id;
  final String name;
  final int facilityId;
  final int? floorLevel;
  final Facility? facility;

  const Zone({
    required this.id,
    required this.name,
    required this.facilityId,
    this.floorLevel,
    this.facility,
  });

  factory Zone.fromJson(Map<String, dynamic> json) {
    return Zone(
      id: jsonInt(json, ['zone_id', 'id']),
      name: jsonStr(json, ['name'], fallback: 'Zone'),
      facilityId: jsonInt(json, ['facility_id']),
      floorLevel: jsonIntOrNull(json, ['floor_level', 'floor']),
      facility: json['facility'] != null
          ? Facility.fromJson(json['facility'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'facility_id': facilityId,
        'floor_level': floorLevel,
        'facility': facility?.toJson(),
      };
}

class Slot {
  final int id;
  final String label;
  final int? floor;
  final String status;
  final int zoneId;
  final Zone? zone;

  const Slot({
    required this.id,
    required this.label,
    this.floor,
    required this.status,
    required this.zoneId,
    this.zone,
  });

  factory Slot.fromJson(Map<String, dynamic> json) {
    final zone = json['zone'] != null
        ? Zone.fromJson(json['zone'] as Map<String, dynamic>)
        : null;
    return Slot(
      id: jsonInt(json, ['slot_id', 'id']),
      label: jsonStr(json, ['slot_code', 'label'], fallback: '—'),
      floor: jsonIntOrNull(json, ['floor']) ?? zone?.floorLevel,
      status: jsonStr(json, ['status'], fallback: 'AVAILABLE'),
      zoneId: jsonInt(json, ['zone_id'], fallback: zone?.id ?? 0),
      zone: zone,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'label': label,
        'floor': floor,
        'status': status,
        'zone_id': zoneId,
        'zone': zone?.toJson(),
      };
}
