// lib/providers/schemes_provider.dart
// Fetches and caches matched schemes from POST /schemes/match.
// Re-fetches automatically when the profile or language changes.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/scheme.dart';
import '../models/match_request.dart';
import '../services/api_service.dart';
import 'language_provider.dart';
import 'profile_provider.dart';

// ── Shared ApiService instance ────────────────────────────────
final apiServiceProvider = Provider<ApiService>((ref) => ApiService());

// ── State class ──────────────────────────────────────────────
class SchemesState {
  final List<MatchedScheme> schemes;
  final bool isLoading;
  final String? error;

  const SchemesState({
    this.schemes = const [],
    this.isLoading = false,
    this.error,
  });

  SchemesState copyWith({
    List<MatchedScheme>? schemes,
    bool? isLoading,
    String? error,
  }) {
    return SchemesState(
      schemes:   schemes   ?? this.schemes,
      isLoading: isLoading ?? this.isLoading,
      error:     error,   // explicitly nullable reset
    );
  }
}

// ── Notifier ─────────────────────────────────────────────────
class SchemesNotifier extends Notifier<SchemesState> {
  @override
  SchemesState build() {
    // Auto-fetch when profile or language changes
    ref.listen(profileProvider,  (_, __) => fetchSchemes());
    ref.listen(languageProvider, (_, __) => fetchSchemes());

    // Kick off initial fetch if profile already exists
    final profile = ref.read(profileProvider);
    if (profile != null) {
      Future.microtask(fetchSchemes);
    }

    return const SchemesState();
  }

  Future<void> fetchSchemes() async {
    final profile = ref.read(profileProvider);
    if (profile == null) return;

    final lang = ref.read(languageProvider);
    state = state.copyWith(isLoading: true);

    try {
      final schemes = await ref.read(apiServiceProvider).matchSchemes(
        MatchRequest(userProfile: profile, language: lang),
      );
      state = SchemesState(schemes: schemes);
    } catch (e) {
      state = SchemesState(error: e.toString());
    }
  }
}

// ── Provider ─────────────────────────────────────────────────
final schemesProvider = NotifierProvider<SchemesNotifier, SchemesState>(
  SchemesNotifier.new,
);
