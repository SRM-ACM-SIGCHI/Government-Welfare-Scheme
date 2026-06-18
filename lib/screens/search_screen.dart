// lib/screens/search_screen.dart
// AI Semantic Search — mirrors frontend/app/search/page.jsx.
// Connects to GET /schemes/semantic-search and GET /schemes/search.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../constants/app_theme.dart';
import '../providers/language_provider.dart';
import '../providers/search_provider.dart';
import '../widgets/chatbot_widget.dart';
import '../widgets/scheme_card.dart';
import '../widgets/skeleton_loader.dart';

// ── Localised strings ─────────────────────────────────────────
const _dict = {
  'en': {
    'title':       'AI Semantic Search',
    'subtitle':    'Search by intent or situation instead of exact keywords',
    'placeholder': 'e.g. financial aid for poor SC female student to study…',
    'searchBtn':   'Search Schemes',
    'hint':        'Try typing your gender, state, occupation, and what help you need.',
    'searching':   'Analysing query & matching schemes…',
    'noResults':   'No schemes matched. Try describing your situation differently.',
    'results':     'Schemes found by intent match:',
  },
  'ta': {
    'title':       'AI கருத்தியல் தேடல்',
    'subtitle':    'சரியான வார்த்தைகளுக்கு பதில் உங்கள் தேவையை விவரியுங்கள்',
    'placeholder': 'எ.கா. ஏழை SC பெண் மாணவர் படிக்க நிதி உதவி…',
    'searchBtn':   'திட்டங்களை தேடு',
    'hint':        'உங்கள் பாலினம், மாநிலம், தொழில் மற்றும் தேவையை எழுதவும்.',
    'searching':   'தேடலை பகுப்பாய்வு செய்கிறது…',
    'noResults':   'பொருந்தும் திட்டங்கள் இல்லை. வேறு விதமாக முயற்சிக்கவும்.',
    'results':     'பொருந்திய திட்டங்கள்:',
  },
  'hi': {
    'title':       'AI सिमेंटिक खोज',
    'subtitle':    'सटीक कीवर्ड के बजाय अपनी स्थिति बताएं',
    'placeholder': 'उदा. गरीब SC महिला छात्र को पढ़ाई के लिए वित्तीय सहायता…',
    'searchBtn':   'योजनाएं खोजें',
    'hint':        'अपना लिंग, राज्य, पेशा और ज़रूरत विस्तार से लिखें।',
    'searching':   'क्वेरी का विश्लेषण और योजनाओं का मिलान…',
    'noResults':   'कोई योजना नहीं मिली। अलग तरीके से लिखें।',
    'results':     'आपकी स्थिति से मेल खाने वाली योजनाएं:',
  },
};

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _doSearch() {
    final q = _controller.text.trim();
    if (q.length >= 2) {
      ref.read(searchProvider.notifier).search(q);
      FocusScope.of(context).unfocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang  = ref.watch(languageProvider);
    final state = ref.watch(searchProvider);
    final t     = _dict[lang] ?? _dict['en']!;

    return Scaffold(
      appBar: AppBar(title: Text(t['title']!)),
      floatingActionButton: const ChatbotWidget(),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header ────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
            child: Text(
              t['subtitle']!,
              style: const TextStyle(
                fontSize: 14,
                color:    AppTheme.textMuted,
              ),
            ),
          ),
          const SizedBox(height: 12),

          // ── Mode toggle ───────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                _ModeChip(
                  label:    'AI Search',
                  selected: state.mode == SearchMode.semantic,
                  onTap:    () => ref
                      .read(searchProvider.notifier)
                      .setMode(SearchMode.semantic),
                ),
                const SizedBox(width: 8),
                _ModeChip(
                  label:    'Keyword',
                  selected: state.mode == SearchMode.keyword,
                  onTap:    () => ref
                      .read(searchProvider.notifier)
                      .setMode(SearchMode.keyword),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // ── Search input ──────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: TextField(
              controller:  _controller,
              maxLines:    3,
              minLines:    1,
              decoration: InputDecoration(
                hintText:   t['placeholder'],
                alignLabelWithHint: true,
              ),
              textInputAction: TextInputAction.search,
              onSubmitted:     (_) => _doSearch(),
            ),
          ),
          const SizedBox(height: 8),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Text(
              t['hint']!,
              style: const TextStyle(
                  fontSize: 12, color: AppTheme.textMuted),
            ),
          ),
          const SizedBox(height: 12),

          // ── Search button ─────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _doSearch,
                child: Text(t['searchBtn']!),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // ── Results ───────────────────────────────────
          Expanded(child: _buildResults(context, state, t)),
        ],
      ),
    );
  }

  Widget _buildResults(
    BuildContext context,
    SearchState state,
    Map<String, String> t,
  ) {
    if (state.isLoading) {
      return Column(
        children: [
          const SizedBox(height: 8),
          Text(t['searching']!,
              style: const TextStyle(
                  fontSize: 13, color: AppTheme.textMuted)),
          const SizedBox(height: 12),
          const Expanded(child: SkeletonList(count: 3)),
        ],
      );
    }

    if (state.error != null) {
      return Center(
        child: Text(state.error!,
            style: const TextStyle(color: AppTheme.error),
            textAlign: TextAlign.center),
      );
    }

    if (state.query.isEmpty) return const SizedBox();

    if (state.results.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Text(t['noResults']!,
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppTheme.textMuted)),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
          child: Text(
            t['results']!,
            style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppTheme.textMuted),
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding:     const EdgeInsets.fromLTRB(20, 0, 20, 100),
            itemCount:   state.results.length,
            itemBuilder: (_, i) => SchemeCard(
              scheme: state.results[i],
              onTap:  () =>
                  context.go('/schemes/${state.results[i].schemeId}'),
            ),
          ),
        ),
      ],
    );
  }
}

class _ModeChip extends StatelessWidget {
  final String       label;
  final bool         selected;
  final VoidCallback onTap;

  const _ModeChip({
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
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
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
