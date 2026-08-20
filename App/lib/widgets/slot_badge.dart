import 'package:flutter/material.dart';

import '../theme.dart';

class SlotBadge extends StatelessWidget {
  final String code;
  final String? zoneLabel;
  final double size;

  const SlotBadge({
    super.key,
    required this.code,
    this.zoneLabel,
    this.size = 120,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: size,
          height: size,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: AppColors.brand,
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: AppColors.brand.withOpacity(0.28),
                blurRadius: 18,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Text(
            code,
            style: TextStyle(
              color: Colors.white,
              fontSize: size * 0.28,
              fontWeight: FontWeight.w800,
              fontFamily: 'monospace',
              letterSpacing: 1.5,
            ),
          ),
        ),
        if (zoneLabel != null) ...[
          const SizedBox(height: 8),
          Text(
            zoneLabel!,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 13),
          ),
        ],
      ],
    );
  }
}
