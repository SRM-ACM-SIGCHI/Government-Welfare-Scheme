// lib/services/storage_service.dart
// Persists user profile and language preference locally.
// Data never leaves the device (mirrors the web app's localStorage approach).

import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/user_profile.dart';

class StorageService {
  // ── Storage keys ─────────────────────────────────────────────
  static const String _profileKey  = 'user_profile';
  static const String _languageKey = 'language';

  // ── Singleton instance ────────────────────────────────────────
  StorageService._();
  static final StorageService instance = StorageService._();

  SharedPreferences? _prefs;

  /// Must be called once at app startup (in main.dart).
  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  SharedPreferences get _p {
    assert(_prefs != null, 'StorageService.init() was not awaited');
    return _prefs!;
  }

  // ── User profile ──────────────────────────────────────────────

  /// Persists the UserProfile as JSON.
  Future<bool> saveProfile(UserProfile profile) async {
    final json = jsonEncode(profile.toJson());
    return _p.setString(_profileKey, json);
  }

  /// Returns the stored UserProfile, or null if none exists.
  UserProfile? getProfile() {
    final raw = _p.getString(_profileKey);
    if (raw == null) return null;
    try {
      final map = jsonDecode(raw) as Map<String, dynamic>;
      return UserProfile.fromJson(map);
    } catch (_) {
      return null;
    }
  }

  /// Returns true if a profile has been saved.
  bool get hasProfile => _p.containsKey(_profileKey);

  /// Deletes the stored profile (used on profile reset).
  Future<bool> deleteProfile() async {
    return _p.remove(_profileKey);
  }

  // ── Language preference ───────────────────────────────────────

  /// Persists the selected language code ('en', 'ta', 'hi').
  Future<bool> saveLanguage(String langCode) async {
    return _p.setString(_languageKey, langCode);
  }

  /// Returns the stored language code, defaulting to 'en'.
  String getLanguage() {
    return _p.getString(_languageKey) ?? 'en';
  }
}
