import 'package:flutter/material.dart';

class AppColors {
  static const bgBase = Color(0xFFF7F8FA);
  static const bgSurface = Color(0xFFFFFFFF);
  static const border = Color(0xFFE4E7EC);
  static const textPrimary = Color(0xFF12151A);
  static const textMuted = Color(0xFF6B7280);
  static const brand = Color(0xFF1959D1);
  static const available = Color(0xFF35C57A);
  static const occupied = Color(0xFFE5484D);
  static const reserved = Color(0xFFF2A93B);
}

ThemeData buildParkerTheme() {
  return ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.brand,
      brightness: Brightness.light,
    ),
    scaffoldBackgroundColor: AppColors.bgBase,
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.bgBase,
      foregroundColor: AppColors.textPrimary,
      elevation: 0,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.bgSurface,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.border),
      ),
    ),
  );
}
