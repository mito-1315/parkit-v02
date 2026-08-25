import 'package:flutter/material.dart';

import '../theme.dart';

class SlotBadge extends StatelessWidget {
  final String label;
  final String? zoneLabel;
  final bool large;

  const SlotBadge({
    super.key,
    required this.label,
    this.zoneLabel,
    this.large = false,
  });

  @override
  Widget build(BuildContext context) {
    final size = large ? 110.0 : 80.0;
    return Column(
      children: [
        Container(
          width: size,
          height: size,
          alignment: Alignment.center,
          decoration: const BoxDecoration(
            color: Pk.primary,
            borderRadius: Pk.r8,
          ),
          child: Text(
            label,
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
            style: const TextStyle(color: Pk.textSecondary, fontSize: 13),
          ),
        ],
      ],
    );
  }
}
