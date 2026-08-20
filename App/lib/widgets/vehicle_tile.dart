import 'package:flutter/material.dart';

import '../models/vehicle.dart';

class VehicleTile extends StatelessWidget {
  final Vehicle vehicle;
  final VoidCallback? onDelete;

  const VehicleTile({super.key, required this.vehicle, this.onDelete});

  IconData _typeIcon(String type) {
    switch (type.toUpperCase()) {
      case 'MOTORCYCLE':
        return Icons.two_wheeler_rounded;
      case 'TRUCK':
      case 'BUS':
        return Icons.local_shipping_rounded;
      default:
        return Icons.directions_car_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 5),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A2E),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFF6366F1).withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              _typeIcon(vehicle.vehicleType),
              color: const Color(0xFF6366F1),
              size: 22,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  vehicle.licensePlate,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 15,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  [
                    if (vehicle.make != null) vehicle.make!,
                    if (vehicle.model != null) vehicle.model!,
                    vehicle.vehicleType,
                    if (vehicle.color != null) '· ${vehicle.color}',
                  ].join(' '),
                  style: const TextStyle(
                    color: Color(0xFF64748B),
                    fontSize: 12,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          if (onDelete != null)
            IconButton(
              icon: const Icon(Icons.delete_outline_rounded,
                  color: Color(0xFFF87171), size: 20),
              onPressed: onDelete,
              tooltip: 'Remove vehicle',
            ),
        ],
      ),
    );
  }
}
