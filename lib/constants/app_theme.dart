// lib/constants/app_theme.dart
import 'package:flutter/material.dart';

class AppTheme {
  AppTheme._();

  // ── Brand colours (from web app CSS) ─────────────────────────
  static const Color primary      = Color(0xFF2563EB); // blue-600
  static const Color primaryDark  = Color(0xFF1D4ED8); // blue-700
  static const Color secondary    = Color(0xFF7C3AED); // violet-600
  static const Color surface      = Color(0xFFFFFFFF);
  static const Color background   = Color(0xFFF9FAFB); // gray-50
  static const Color onBackground = Color(0xFF111827); // gray-900
  static const Color textMuted    = Color(0xFF6B7280); // gray-500
  static const Color border       = Color(0xFFE5E7EB); // gray-200
  static const Color success      = Color(0xFF16A34A); // green-600
  static const Color successBg    = Color(0xFFF0FDF4); // green-50
  static const Color error        = Color(0xFFDC2626); // red-600

  static ThemeData get light {
    final base = ColorScheme.fromSeed(
      seedColor: primary,
      brightness: Brightness.light,
      primary: primary,
      onPrimary: Colors.white,
      secondary: secondary,
      onSecondary: Colors.white,
      surface: surface,
      onSurface: onBackground,
      error: error,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: base,
      scaffoldBackgroundColor: background,
      fontFamily: 'Roboto', // system default; swap to 'Inter' if bundled

      // ── AppBar ────────────────────────────────────────────────
      appBarTheme: const AppBarTheme(
        backgroundColor: surface,
        foregroundColor: onBackground,
        elevation: 0,
        scrolledUnderElevation: 1,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: onBackground,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),

      // ── Cards ─────────────────────────────────────────────────
      cardTheme: CardThemeData(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: border),
        ),
        margin: EdgeInsets.zero,
      ),

      // ── Elevated buttons ──────────────────────────────────────
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
          minimumSize: const Size.fromHeight(52),
        ),
      ),

      // ── Outlined buttons ──────────────────────────────────────
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: onBackground,
          side: const BorderSide(color: border),
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
          minimumSize: const Size.fromHeight(52),
        ),
      ),

      // ── Input decoration ──────────────────────────────────────
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surface,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: error),
        ),
      ),

      // ── Chip ─────────────────────────────────────────────────
      chipTheme: ChipThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),

      // ── BottomNavigationBar ───────────────────────────────────
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: surface,
        selectedItemColor: primary,
        unselectedItemColor: textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),

      // ── ListTile ─────────────────────────────────────────────
      listTileTheme: const ListTileThemeData(
        contentPadding: EdgeInsets.symmetric(horizontal: 20, vertical: 4),
      ),

      // ── Divider ──────────────────────────────────────────────
      dividerTheme: const DividerThemeData(
        color: border,
        thickness: 1,
        space: 1,
      ),
    );
  }
}
