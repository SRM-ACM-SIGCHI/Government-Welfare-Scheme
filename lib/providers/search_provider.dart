// lib/providers/search_provider.dart
// Manages the search screen state.
// Connects to GET /schemes/search and GET /schemes/semantic-search.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/scheme.dart';
import 'language_provider.dart';
import 'schemes_provider.dart';

// ── Search mode ───────────────────────────────────────────────
enum SearchMode { keyword, semantic }

// ── State ────────────────────────────────────────────────────
class SearchState {
  final List<MatchedScheme> results;
  final bool isLoading;
  final String? error;
  final String query;
  final SearchMode mode;

  const SearchState({
    this.results   = const [],
    this.isLoading = false,
    this.error,
    this.query     = '',
    this.mode      = SearchMode.semantic,
  });

  SearchState copyWith({
    List<MatchedScheme>? results,
    bool? isLoading,
    String? error,
    String? query,
    SearchMode? mode,
  }) {
    return SearchState(
      results:   results   ?? this.results,
      isLoading: isLoading ?? this.isLoading,
      error:     error,
      query:     query     ?? this.query,
      mode:      mode      ?? this.mode,
    );
  }
}

// ── Notifier ─────────────────────────────────────────────────
class SearchNotifier extends Notifier<SearchState> {
  @override
  SearchState build() => const SearchState();

  void setMode(SearchMode mode) {
    state = state.copyWith(mode: mode, results: [], error: null);
  }

  Future<void> search(String query) async {
    if (query.trim().length < 2) return;

    state = state.copyWith(isLoading: true, query: query, error: null);

    final api  = ref.read(apiServiceProvider);
    final lang = ref.read(languageProvider);

    try {
      final results = state.mode == SearchMode.semantic
          ? await api.semanticSearch(query, lang)
          : await api.searchSchemes(query);
      state = SearchState(results: results, query: query, mode: state.mode);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void clear() {
    state = const SearchState();
  }
}

// ── Provider ─────────────────────────────────────────────────
final searchProvider = NotifierProvider<SearchNotifier, SearchState>(
  SearchNotifier.new,
);
