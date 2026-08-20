import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// ─── Parkit Design Tokens ────────────────────────────────────────────────────

class Pk {
  // Backgrounds
  static const bg       = Color(0xFF0D0D0D);
  static const surface  = Color(0xFF181818);
  static const surface2 = Color(0xFF222222);
  static const border   = Color(0xFF2C2C2C);
  static const border2  = Color(0xFF383838);

  // Brand
  static const primary   = Color(0xFF2563EB);
  static const primaryLt = Color(0xFF3B82F6);
  static const success   = Color(0xFF16A34A);
  static const successLt = Color(0xFF22C55E);
  static const warning   = Color(0xFFD97706);
  static const danger    = Color(0xFFDC2626);
  static const dangerLt  = Color(0xFFF87171);

  // Text
  static const textPrimary   = Color(0xFFF1F5F9);
  static const textSecondary = Color(0xFF94A3B8);
  static const textMuted     = Color(0xFF475569);

  // Radius — intentionally small for a sharp, professional look
  static const r4  = BorderRadius.all(Radius.circular(4));
  static const r6  = BorderRadius.all(Radius.circular(6));
  static const r8  = BorderRadius.all(Radius.circular(8));
  static const r10 = BorderRadius.all(Radius.circular(10));
}

// ─── Input decoration ────────────────────────────────────────────────────────

InputDecoration pkInputDecoration({
  required String hint,
  required IconData icon,
  Widget? suffix,
}) {
  const radius = Radius.circular(6);
  const r = BorderRadius.all(radius);
  return InputDecoration(
    hintText: hint,
    hintStyle: const TextStyle(color: Pk.textMuted, fontSize: 14),
    prefixIcon: Icon(icon, color: Pk.primary, size: 18),
    suffixIcon: suffix,
    filled: true,
    fillColor: Pk.surface2,
    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
    border: OutlineInputBorder(borderRadius: r, borderSide: const BorderSide(color: Pk.border)),
    enabledBorder: OutlineInputBorder(borderRadius: r, borderSide: const BorderSide(color: Pk.border)),
    focusedBorder: OutlineInputBorder(borderRadius: r, borderSide: const BorderSide(color: Pk.primary, width: 1.5)),
    errorBorder: OutlineInputBorder(borderRadius: r, borderSide: const BorderSide(color: Pk.danger, width: 1.5)),
    focusedErrorBorder: OutlineInputBorder(borderRadius: r, borderSide: const BorderSide(color: Pk.danger, width: 1.5)),
    errorStyle: const TextStyle(color: Pk.dangerLt, fontSize: 12),
  );
}

// ─── Theme ───────────────────────────────────────────────────────────────────

ThemeData parkitTheme() {
  return ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: Pk.bg,
    colorScheme: const ColorScheme.dark(
      primary: Pk.primary,
      secondary: Pk.primaryLt,
      surface: Pk.surface,
      error: Pk.danger,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Pk.bg,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: Pk.textPrimary,
        fontSize: 17,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.1,
      ),
      iconTheme: IconThemeData(color: Pk.textSecondary),
      systemOverlayStyle: SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
      ),
    ),
    textTheme: const TextTheme(
      displayLarge: TextStyle(color: Pk.textPrimary, fontWeight: FontWeight.w800),
      displayMedium: TextStyle(color: Pk.textPrimary, fontWeight: FontWeight.w700),
      bodyLarge: TextStyle(color: Pk.textPrimary, fontSize: 15),
      bodyMedium: TextStyle(color: Pk.textSecondary, fontSize: 13),
      labelLarge: TextStyle(color: Pk.textPrimary, fontWeight: FontWeight.w600),
    ),
    dividerTheme: const DividerThemeData(color: Pk.border, thickness: 1, space: 1),
    cardTheme: const CardThemeData(
      color: Pk.surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: Pk.r8,
        side: BorderSide(color: Pk.border),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Pk.surface2,
      border: OutlineInputBorder(
        borderRadius: Pk.r6,
        borderSide: const BorderSide(color: Pk.border),
      ),
    ),
    snackBarTheme: const SnackBarThemeData(
      backgroundColor: Pk.surface2,
      contentTextStyle: TextStyle(color: Pk.textPrimary, fontSize: 14),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: Pk.r6),
    ),
    progressIndicatorTheme: const ProgressIndicatorThemeData(color: Pk.primary),
  );
}
