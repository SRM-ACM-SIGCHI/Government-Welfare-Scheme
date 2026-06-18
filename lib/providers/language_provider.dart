// lib/providers/language_provider.dart
// Manages the selected UI + API language ('en' | 'ta' | 'hi').
// Persists via StorageService so the choice survives app restarts.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/storage_service.dart';

// ── Locale map ────────────────────────────────────────────────
const Map<String, Locale> _localeMap = {
  'en': Locale('en'),
  'ta': Locale('ta'),
  'hi': Locale('hi'),
};

// ── Notifier ─────────────────────────────────────────────────
class LanguageNotifier extends Notifier<String> {
  @override
  String build() {
    // Initial value loaded from SharedPreferences
    return StorageService.instance.getLanguage();
  }

  void setLanguage(String code) {
    assert(
      ['en', 'ta', 'hi'].contains(code),
      'Language code must be en, ta, or hi',
    );
    state = code;
    StorageService.instance.saveLanguage(code);
  }
}

// ── Providers ────────────────────────────────────────────────

/// The active language code ('en', 'ta', 'hi').
final languageProvider = NotifierProvider<LanguageNotifier, String>(
  LanguageNotifier.new,
);

/// Derived: the Flutter Locale object for MaterialApp.locale.
final localeProvider = Provider<Locale>((ref) {
  final code = ref.watch(languageProvider);
  return _localeMap[code] ?? const Locale('en');
});
