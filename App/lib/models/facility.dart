import '../utils/json.dart';

class Facility {
  final int id;
  final String name;
  final String? address;

  const Facility({
    required this.id,
    required this.name,
    this.address,
  });

  factory Facility.fromJson(Map<String, dynamic> json) {
    return Facility(
      id: jsonInt(json, ['facility_id', 'id']),
      name: jsonStr(json, ['name'], fallback: 'Facility'),
      address: jsonStrOrNull(json, ['address']),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'address': address,
      };
}
