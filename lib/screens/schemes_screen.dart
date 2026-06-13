// lib/screens/schemes_screen.dart
// Matched schemes feed — mirrors frontend/app/schemes/page.jsx.
// Features: scheme list from POST /schemes/match, benefit type filter,
// inline semantic search bar using GET /schemes/semantic-search.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../constants/app_constants.dart';
import '../constants/app_theme.dart';
import '../providers/language_provider.dart';
import '../providers/profile_provider.dart';
import '../providers/schemes_provider.dart';
import '../providers/search_provider.dart';
import '../widgets/chatbot_widget.dart';
import '../widgets/scheme_card.dart';
import '../widgets/skeleton_loader.dart';

class SchemesScreen extends ConsumerStatefulWidget {
  const SchemesScreen({super.key});

  @override
  ConsumerState<SchemesScreen> createState() => _SchemesScreenState();
}

class _SchemesScreenState extends ConsumerState<SchemesScreen> {
  String _filter = 'all';
  final _searchController = TextEditingController();
  bool   _searchActive    = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final profile     = ref.watch(profileProvider);
    final schemesState = ref.watch(schemesProvider);
    final searchState  = ref.watch(searchProvider);
    final lang        = ref.watch(languageProvider);

    if (profile == null) {
      WidgetsBinding.instance.addPostFrameCallback(
          (_) => context.go('/onboarding'));
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final displaySchemes = _searchActive && searchState.query.isNotEmpty
        ? searchState.results
        : schemesState.schemes.where((s) {
            if (_filter == 'all') return true;
            return s.benefitType == _filter;
          }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Schemes'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () =>
                ref.read(schemesProvider.notifier).fetchSchemes(),
          ),
        ],
      ),
      floatingActionButton: const ChatbotWidget(),
      body: Column(
        children: [
          // ── Search bar ────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText:       'Search schemes by AI…',
                prefixIcon:     const Icon(Icons.search, color: AppTheme.textMuted),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.close, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          ref.read(searchProvider.notifier).clear();
                          setState(() => _searchActive = false);
                        },
                      )
                    : null,
              ),
              onChanged: (v) => setState(() => _searchActive = v.isNotEmpty),
              onSubmitted: (v) {
                if (v.trim().length >= 2) {
                  ref.read(searchProvider.notifier).search(v.trim());
                }
              },
            ),
          ),

          // ── Benefit type filter chips ─────────────────
          if (!_searchActive) ...[
            const SizedBox(height: 12),
            SizedBox(
              height: 36,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
                  _FilterChip(
                    label:    'All',
                    selected: _filter == 'all',
                    onTap:    () => setState(() => _filter = 'all'),
                  ),
                  ...AppConstants.benefitTypes.entries.map((e) => _FilterChip(
                        label:    e.value['label'] as String,
                        selected: _filter == e.key,
                        onTap:    () => setState(() => _filter = e.key),
                      )),
                ],
              ),
            ),
          ],

          // ── Subtitle ──────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 4),
            child: Row(
              children: [
                Text(
                  _searchActive && searchState.query.isNotEmpty
                      ? '${displaySchemes.length} results'
                      : '${schemesState.schemes.length} schemes matched for you',
                  style: const TextStyle(
                    fontSize:   13,
                    color:      AppTheme.textMuted,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),

          // ── List ──────────────────────────────────────
          Expanded(
            child: _buildBody(
              context:       context,
              loading:       _searchActive ? searchState.isLoading : schemesState.isLoading,
              error:         _searchActive ? searchState.error : schemesState.error,
              schemes:       displaySchemes,
              isEmpty:       displaySchemes.isEmpty &&
                             !(_searchActive ? searchState.isLoading : schemesState.isLoading),
              onRetry:       () => ref.read(schemesProvider.notifier).fetchSchemes(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBody({
    required BuildContext context,
    required bool loading,
    required String? error,
    required List<dynamic> schemes,
    required bool isEmpty,
    required VoidCallback onRetry,
  }) {
    if (loading) return const SkeletonList();

    if (error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('😕', style: TextStyle(fontSize: 48)),
              const SizedBox(height: 12),
              Text(error,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppTheme.textMuted)),
              const SizedBox(height: 16),
              ElevatedButton(onPressed: onRetry, child: const Text('Retry')),
            ],
          ),
        ),
      );
    }

    if (isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('🔍', style: TextStyle(fontSize: 48)),
              SizedBox(height: 12),
              Text('No schemes found',
                  style: TextStyle(
                      fontSize: 18, fontWeight: FontWeight.w600)),
              SizedBox(height: 8),
              Text(
                'Try updating your profile or searching differently.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppTheme.textMuted),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding:     const EdgeInsets.fromLTRB(20, 4, 20, 100),
      itemCount:   schemes.length,
      itemBuilder: (_, i) => SchemeCard(
        scheme: schemes[i],
        onTap:  () => context.go('/schemes/${schemes[i].schemeId}'),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String       label;
  final bool         selected;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color:        selected ? AppTheme.primary : Colors.white,
          border:       Border.all(
              color: selected ? AppTheme.primary : AppTheme.border),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize:   13,
            fontWeight: FontWeight.w500,
            color:      selected ? Colors.white : const Color(0xFF374151),
          ),
        ),
      ),
    );
  }
}
