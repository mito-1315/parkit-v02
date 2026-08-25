import 'slot.dart';
import 'vehicle.dart';
import '../utils/json.dart';

enum SessionStatus {
  detecting,
  reserved,
  active,
  completed,
  cancelled;

  static SessionStatus fromString(String s) {
    switch (s.toUpperCase()) {
      case 'DETECTING':
        return SessionStatus.detecting;
      case 'RESERVED':
        return SessionStatus.reserved;
      case 'ACTIVE':
        return SessionStatus.active;
      case 'COMPLETED':
        return SessionStatus.completed;
      case 'CANCELLED':
        return SessionStatus.cancelled;
      case 'EXPIRED':
        return SessionStatus.cancelled;
      default:
        return SessionStatus.detecting;
    }
  }

  String get label {
    switch (this) {
      case SessionStatus.detecting:
        return 'Detecting';
      case SessionStatus.reserved:
        return 'Reserved';
      case SessionStatus.active:
        return 'Active';
      case SessionStatus.completed:
        return 'Completed';
      case SessionStatus.cancelled:
        return 'Cancelled';
    }
  }

  bool get isAllocated =>
      this == SessionStatus.reserved || this == SessionStatus.active;

  bool get isPending => this == SessionStatus.detecting;
}

class ParkingSession {
  final int id;
  final SessionStatus status;
  final int? slotId;
  final int? vehicleId;
  final int? entryGateId;
  final int? exitGateId;
  final DateTime? entryTime;
  final DateTime? exitTime;
  final Slot? slot;
  final Vehicle? vehicle;
  final String? facilityName;
  final double? parkingFee;
  final String? paymentStatus;
  final int? durationMinutes;
  final String? currency;

  const ParkingSession({
    required this.id,
    required this.status,
    this.slotId,
    this.vehicleId,
    this.entryGateId,
    this.exitGateId,
    this.entryTime,
    this.exitTime,
    this.slot,
    this.vehicle,
    this.facilityName,
    this.parkingFee,
    this.paymentStatus,
    this.durationMinutes,
    this.currency,
  });

  factory ParkingSession.fromJson(Map<String, dynamic> json) {
    final slot = json['slot'] != null
        ? Slot.fromJson(json['slot'] as Map<String, dynamic>)
        : null;
    final facilityName = jsonStrOrNull(json, ['facilityName']) ??
        (json['facility'] is Map
            ? jsonStrOrNull(json['facility'] as Map<String, dynamic>, ['name'])
            : null) ??
        slot?.zone?.facility?.name;
    return ParkingSession(
      id: jsonInt(json, ['session_id', 'id']),
      status: SessionStatus.fromString(json['status'] as String? ?? 'RESERVED'),
      slotId: jsonIntOrNull(json, ['slot_id']),
      vehicleId: jsonIntOrNull(json, ['vehicle_id']),
      entryGateId: jsonIntOrNull(json, ['entry_gate_id']),
      exitGateId: jsonIntOrNull(json, ['exit_gate_id']),
      entryTime: json['entry_time'] != null
          ? DateTime.tryParse(json['entry_time'] as String)
          : null,
      exitTime: json['exit_time'] != null
          ? DateTime.tryParse(json['exit_time'] as String)
          : null,
      slot: slot,
      vehicle: json['vehicle'] != null
          ? Vehicle.fromJson(json['vehicle'] as Map<String, dynamic>)
          : null,
      facilityName: facilityName,
      parkingFee: json['parking_fee'] != null
          ? double.tryParse(json['parking_fee'].toString())
          : (json['parkingFee'] != null
              ? double.tryParse(json['parkingFee'].toString())
              : null),
      paymentStatus: jsonStrOrNull(json, ['payment_status', 'paymentStatus']),
      durationMinutes: jsonIntOrNull(json, ['duration_minutes', 'durationMinutes']),
      currency: jsonStrOrNull(json, ['currency']) ??
          (json['facility'] is Map
              ? jsonStrOrNull(json['facility'] as Map<String, dynamic>, ['currency'])
              : null),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'status': status.name.toUpperCase(),
        'slot_id': slotId,
        'vehicle_id': vehicleId,
        'entry_gate_id': entryGateId,
        'exit_gate_id': exitGateId,
        'entry_time': entryTime?.toIso8601String(),
        'exit_time': exitTime?.toIso8601String(),
        'slot': slot?.toJson(),
        'vehicle': vehicle?.toJson(),
        'parking_fee': parkingFee,
        'payment_status': paymentStatus,
        'duration_minutes': durationMinutes,
        'currency': currency,
      };

  /// Duration of the session (elapsed or total).
  Duration get duration {
    final start = entryTime ?? DateTime.now();
    final end = exitTime ?? DateTime.now();
    return end.difference(start);
  }

  ParkingSession copyWith({
    SessionStatus? status,
    int? slotId,
    Slot? slot,
    DateTime? entryTime,
    DateTime? exitTime,
    String? facilityName,
    double? parkingFee,
    String? paymentStatus,
    int? durationMinutes,
    String? currency,
  }) {
    return ParkingSession(
      id: id,
      status: status ?? this.status,
      slotId: slotId ?? this.slotId,
      vehicleId: vehicleId,
      entryGateId: entryGateId,
      exitGateId: exitGateId,
      entryTime: entryTime ?? this.entryTime,
      exitTime: exitTime ?? this.exitTime,
      slot: slot ?? this.slot,
      vehicle: vehicle,
      facilityName: facilityName ?? this.facilityName,
      parkingFee: parkingFee ?? this.parkingFee,
      paymentStatus: paymentStatus ?? this.paymentStatus,
      durationMinutes: durationMinutes ?? this.durationMinutes,
      currency: currency ?? this.currency,
    );
  }
}
