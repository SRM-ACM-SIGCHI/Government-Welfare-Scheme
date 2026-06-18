// lib/providers/profile_provider.dart
// Manages the saved UserProfile (loaded from SharedPreferences).

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/user_profile.dart';
import '../services/storage_service.dart';

// ── Notifier ─────────────────────────────────────────────────
class ProfileNotifier extends Notifier<UserProfile?> {
  @override
  UserProfile? build() {
    return StorageService.instance.getProfile();
  }

  /// Save a new or updated profile; also clears any cached scheme results.
  Future<void> saveProfile(UserProfile profile) async {
    await StorageService.instance.saveProfile(profile);
    state = profile;
  }

  /// Delete the profile (resets onboarding flow).
  Future<void> deleteProfile() async {
    await StorageService.instance.deleteProfile();
    state = null;
  }

  bool get hasProfile => state != null;
}

// ── Provider ─────────────────────────────────────────────────

/// The stored UserProfile. Null means onboarding is not complete.
final profileProvider = NotifierProvider<ProfileNotifier, UserProfile?>(
  ProfileNotifier.new,
);
