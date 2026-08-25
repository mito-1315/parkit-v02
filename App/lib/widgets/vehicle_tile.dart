import 'package:flutter/material.dart';

import '../models/vehicle.dart';
import '../theme.dart';

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
        return Icons.directions_car_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Pk.border)),
      ),
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
<<<<<<< HEAD
            color: Pk.primary.withAlpha((0.1 * 255).round()),
=======
            color: Pk.primary.withOpacity(0.1),
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
            borderRadius: Pk.r6,
          ),
          child: Icon(_typeIcon(vehicle.vehicleType),
              color: Pk.primary, size: 20),
        ),
        title: Text(
          vehicle.licensePlate,
          style: const TextStyle(
            color: Pk.textPrimary,
            fontWeight: FontWeight.w700,
            fontSize: 15,
            letterSpacing: 1.0,
          ),
        ),
        subtitle: Text(
          [
            if (vehicle.make != null) vehicle.make!,
            if (vehicle.model != null) vehicle.model!,
            vehicle.vehicleType,
            if (vehicle.color != null) '· ${vehicle.color}',
          ].join(' '),
          style: const TextStyle(color: Pk.textMuted, fontSize: 12),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        trailing: onDelete != null
            ? IconButton(
                icon: const Icon(Icons.delete_outline_rounded,
                    color: Pk.dangerLt, size: 20),
                onPressed: onDelete,
                tooltip: 'Remove vehicle',
              )
            : null,
      ),
    );
  }
}
