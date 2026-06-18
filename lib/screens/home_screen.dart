// lib/screens/home_screen.dart
// Landing page — mirrors the web app's page.jsx.
// Features: language switcher, voice search, safe-verified trust box, CTA.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:speech_to_text/speech_to_text.dart';

import '../constants/app_constants.dart';
import '../constants/app_theme.dart';
import '../models/match_request.dart';
import '../models/scheme.dart';
import '../models/user_profile.dart';
import '../providers/language_provider.dart';
import '../providers/profile_provider.dart';
import '../providers/schemes_provider.dart';
import '../widgets/language_switcher.dart';

// ── Voice result helper ───────────────────────────────────────
UserProfile _extractProfileFromSpeech(String text) {
  final lower = text.toLowerCase();
  String state     = 'TN';
  String gender    = 'female';
  String caste     = 'OBC';
  int    age       = 30;
  int    income    = 120000;
  String occ       = 'unorganised_worker';

  AppConstants.voiceKeywordMap.forEach((kw, val) {
    if (lower.contains(kw.toLowerCase())) {
      const stateSet = {'TN','MH','DL','KA','AP','KL','UP','WB','GJ','RJ','BR','OD'};
      const genderSet = {'male','female','other'};
      const casteSet = {'SC','ST','OBC','EWS','GEN'};
      const occSet = {'farmer','student','unorganised_worker','self_employed','unemployed','salaried'};
      if (stateSet.contains(val))  state  = val;
      if (genderSet.contains(val)) gender = val;
      if (casteSet.contains(val))  caste  = val;
      if (occSet.contains(val))    occ    = val;
    }
  });

  AppConstants.voiceIncomeKeywords.forEach((kw, val) {
    if (lower.contains(kw)) income = val;
  });

  final ageMatch = RegExp(r'(\d{1,3})\s*(years|yrs|age)', caseSensitive: false)
      .firstMatch(text);
  if (ageMatch != null) {
    final parsed = int.tryParse(ageMatch.group(1) ?? '');
    if (parsed != null && parsed > 0 && parsed < 120) age = parsed;
  }

  return UserProfile(
    state:          state,
    gender:         gender,
    casteCategory:  caste,
    age:            age,
    incomeAnnual:   income,
    occupationType: occ,
  );
}

// ── Screen ────────────────────────────────────────────────────
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final _stt = SpeechToText();

  bool   _sttAvailable = false;
  bool   _isListening  = false;
  String _transcript   = '';
  bool   _searching    = false;
  String _voiceError   = '';
  List<MatchedScheme> _voiceResults = [];

  @override
  void initState() {
    super.initState();
    _initStt();
  }

  Future<void> _initStt() async {
    final available = await _stt.initialize(
      onError: (e) => setState(() {
        _isListening = false;
        _voiceError  = 'Voice error: ${e.errorMsg}';
      }),
    );
    if (mounted) setState(() => _sttAvailable = available);
  }

  Future<void> _startListening() async {
    if (!_sttAvailable) {
      setState(() => _voiceError = 'Voice input not available on this device.');
      return;
    }
    setState(() {
      _voiceError   = '';
      _transcript   = '';
      _voiceResults = [];
    });

    final lang = ref.read(languageProvider);
    final locale = AppConstants.speechLocales[lang] ?? 'en_IN';

    await _stt.listen(
      localeId: locale,
      onResult: (result) {
        setState(() => _transcript = result.recognizedWords);
        if (result.finalResult && _transcript.isNotEmpty) {
          _searchFromSpeech(_transcript);
        }
      },
    );
    setState(() => _isListening = true);
  }

  void _stopListening() {
    _stt.stop();
    setState(() => _isListening = false);
  }

  Future<void> _searchFromSpeech(String text) async {
    setState(() => _searching = true);
    final profile = _extractProfileFromSpeech(text);
    final lang    = ref.read(languageProvider);
    try {
      final api     = ref.read(apiServiceProvider);
      final schemes = await api.matchSchemes(
        MatchRequest(userProfile: profile, language: lang),
      );
      setState(() => _voiceResults = schemes);
    } catch (_) {
      setState(() => _voiceError = 'Could not connect to server.');
    } finally {
      setState(() => _searching = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang       = ref.watch(languageProvider);
    final hasProfile = ref.watch(profileProvider) != null;
    final l10n       = _L10n.of(lang);

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // ── Icon ──────────────────────────────────────
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppTheme.primary,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Center(
                  child: Text('🏛️', style: TextStyle(fontSize: 36)),
                ),
              ),
              const SizedBox(height: 20),

              // ── Headline ─────────────────────────────────
              const Text(
                'Welfare Schemes',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.onBackground,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                l10n.tagline,
                style: const TextStyle(
                  fontSize: 16,
                  color: AppTheme.textMuted,
                  height: 1.6,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),

              // ── Language switcher ─────────────────────────
              const LanguageSwitcher(),
              const SizedBox(height: 24),

              // ── Trust box ─────────────────────────────────
              _TrustBox(l10n: l10n),
              const SizedBox(height: 20),

              // ── Voice search box ──────────────────────────
              _VoiceBox(
                l10n:         l10n,
                isListening:  _isListening,
                transcript:   _transcript,
                searching:    _searching,
                voiceError:   _voiceError,
                voiceResults: _voiceResults,
                onStart:      _startListening,
                onStop:       _stopListening,
                onSeeAll: (profile) {
                  ref.read(profileProvider.notifier).saveProfile(profile);
                  context.go('/schemes');
                },
                onSchemeTap:  (id) => context.go('/schemes/$id'),
              ),
              const SizedBox(height: 24),

              // ── CTA buttons ───────────────────────────────
              if (hasProfile) ...[
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => context.go('/schemes'),
                    child: Text(l10n.ctaSeeMySchemes),
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () => context.go('/profile'),
                    child: Text(l10n.ctaUpdateProfile),
                  ),
                ),
              ] else
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => context.go('/onboarding'),
                    child: Text(l10n.ctaGetStarted),
                  ),
                ),
              const SizedBox(height: 12),
              Text(
                l10n.onboardingMinutes,
                style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Trust box ─────────────────────────────────────────────────
class _TrustBox extends StatelessWidget {
  final _L10n l10n;
  const _TrustBox({required this.l10n});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.successBg,
        border: Border.all(color: const Color(0xFFDCFCE7)),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '✅ ${l10n.safeTitle}',
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Color(0xFF166534),
            ),
          ),
          const SizedBox(height: 8),
          ...['• ${l10n.safeLine1}', '• ${l10n.safeLine2}', '• ${l10n.safeLine3}']
              .map((s) => Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      s,
                      style: const TextStyle(
                        fontSize: 13,
                        color: Color(0xFF15803D),
                      ),
                    ),
                  )),
        ],
      ),
    );
  }
}

// ── Voice search box ──────────────────────────────────────────
class _VoiceBox extends StatelessWidget {
  final _L10n              l10n;
  final bool               isListening;
  final String             transcript;
  final bool               searching;
  final String             voiceError;
  final List<MatchedScheme> voiceResults;
  final VoidCallback       onStart;
  final VoidCallback       onStop;
  final void Function(UserProfile) onSeeAll;
  final void Function(String)      onSchemeTap;

  const _VoiceBox({
    required this.l10n,
    required this.isListening,
    required this.transcript,
    required this.searching,
    required this.voiceError,
    required this.voiceResults,
    required this.onStart,
    required this.onStop,
    required this.onSeeAll,
    required this.onSchemeTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFFAF5FF),
        border: Border.all(color: const Color(0xFFE9D5FF)),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Text(
            '🎤 ${l10n.voiceTitle}',
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: Color(0xFF6D28D9),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            l10n.voiceHint,
            style: const TextStyle(fontSize: 13, color: Color(0xFF7C3AED)),
          ),
          const SizedBox(height: 16),

          // Mic button
          GestureDetector(
            onTap: isListening ? onStop : onStart,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isListening
                    ? const Color(0xFFDC2626)
                    : const Color(0xFF7C3AED),
                boxShadow: [
                  BoxShadow(
                    color: (isListening
                            ? const Color(0xFFDC2626)
                            : const Color(0xFF7C3AED))
                        .withOpacity(0.3),
                    blurRadius: 16,
                    spreadRadius: isListening ? 8 : 0,
                  ),
                ],
              ),
              child: Center(
                child: Text(
                  isListening ? '⏹' : '🎤',
                  style: const TextStyle(fontSize: 28),
                ),
              ),
            ),
          ),

          if (isListening) ...[
            const SizedBox(height: 8),
            Text(
              l10n.voiceListening,
              style: const TextStyle(
                fontSize: 13,
                color: Color(0xFFDC2626),
                fontWeight: FontWeight.w500,
              ),
            ),
          ],

          if (transcript.isNotEmpty) ...[
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFE9D5FF)),
              ),
              child: Text(
                '"$transcript"',
                style: const TextStyle(
                  fontSize: 13,
                  fontStyle: FontStyle.italic,
                  color: Color(0xFF374151),
                ),
              ),
            ),
          ],

          if (searching) ...[
            const SizedBox(height: 8),
            Text(
              l10n.voiceFinding,
              style: const TextStyle(fontSize: 13, color: Color(0xFF7C3AED)),
            ),
          ],

          if (voiceError.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              voiceError,
              style: const TextStyle(fontSize: 13, color: AppTheme.error),
              textAlign: TextAlign.center,
            ),
          ],

          if (voiceResults.isNotEmpty && !searching) ...[
            const SizedBox(height: 12),
            ...voiceResults.take(3).map(
                  (s) => _VoiceResultTile(
                    scheme:   s,
                    onTap:    () => onSchemeTap(s.schemeId),
                  ),
                ),
            if (voiceResults.length > 3)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF7C3AED),
                    ),
                    onPressed: () {
                      final profile = _extractProfileFromSpeech(transcript);
                      onSeeAll(profile);
                    },
                    child: Text('See all ${voiceResults.length} schemes →'),
                  ),
                ),
              ),
          ],
        ],
      ),
    );
  }
}

class _VoiceResultTile extends StatelessWidget {
  final MatchedScheme scheme;
  final VoidCallback  onTap;

  const _VoiceResultTile({required this.scheme, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 6),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: const Color(0xFFE9D5FF)),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                scheme.name,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: AppTheme.onBackground,
                ),
              ),
            ),
            const Text('›', style: TextStyle(color: Color(0xFF7C3AED))),
          ],
        ),
      ),
    );
  }
}

// ── Inline localisation helper (before generated l10n is available) ──
class _L10n {
  final String tagline;
  final String ctaGetStarted;
  final String ctaSeeMySchemes;
  final String ctaUpdateProfile;
  final String onboardingMinutes;
  final String safeTitle;
  final String safeLine1;
  final String safeLine2;
  final String safeLine3;
  final String voiceTitle;
  final String voiceHint;
  final String voiceListening;
  final String voiceFinding;

  const _L10n({
    required this.tagline,
    required this.ctaGetStarted,
    required this.ctaSeeMySchemes,
    required this.ctaUpdateProfile,
    required this.onboardingMinutes,
    required this.safeTitle,
    required this.safeLine1,
    required this.safeLine2,
    required this.safeLine3,
    required this.voiceTitle,
    required this.voiceHint,
    required this.voiceListening,
    required this.voiceFinding,
  });

  static _L10n of(String lang) {
    return _strings[lang] ?? _strings['en']!;
  }

  static const Map<String, _L10n> _strings = {
    'en': _L10n(
      tagline:           'Find government schemes you are eligible for',
      ctaGetStarted:     'Get Started — Free',
      ctaSeeMySchemes:   'See My Schemes',
      ctaUpdateProfile:  'Update My Profile',
      onboardingMinutes: 'Takes less than 1 minute • No sign up required',
      safeTitle:         'Safe & Verified',
      safeLine1:         'We never ask for Aadhaar or bank details',
      safeLine2:         'All links go to official government sites',
      safeLine3:         'Your data stays on your phone',
      voiceTitle:        'Speak to find schemes',
      voiceHint:         'Tap mic and speak your details',
      voiceListening:    'Listening…',
      voiceFinding:      'Finding schemes…',
    ),
    'ta': _L10n(
      tagline:           'நீங்கள் தகுதியான திட்டங்களை கண்டறியுங்கள்',
      ctaGetStarted:     'தொடங்குங்கள் — இலவசம்',
      ctaSeeMySchemes:   'என் திட்டங்களை பாருங்கள்',
      ctaUpdateProfile:  'விவரங்களை மாற்றுங்கள்',
      onboardingMinutes: '1 நிமிடத்திற்கும் குறைவாக • பதிவு தேவையில்லை',
      safeTitle:         'பாதுகாப்பான & சரிபார்க்கப்பட்டது',
      safeLine1:         'ஆதார் அல்லது வங்கி விவரங்களை நாங்கள் கேட்கமாட்டோம்',
      safeLine2:         'அனைத்து இணைப்புகளும் அதிகாரப்பூர்வ அரசு தளங்களுக்கு செல்கின்றன',
      safeLine3:         'உங்கள் தரவு உங்கள் தொலைபேசியில் மட்டுமே இருக்கும்',
      voiceTitle:        'பேசி திட்டங்கள் கண்டறியுங்கள்',
      voiceHint:         'மைக்கை தட்டி பேசுங்கள்',
      voiceListening:    'கேட்கிறது…',
      voiceFinding:      'திட்டங்களை தேடுகிறது…',
    ),
    'hi': _L10n(
      tagline:           'अपने लिए योग्य सरकारी योजनाएं खोजें',
      ctaGetStarted:     'शुरू करें — मुफ़्त',
      ctaSeeMySchemes:   'मेरी योजनाएं देखें',
      ctaUpdateProfile:  'प्रोफाइल अपडेट करें',
      onboardingMinutes: '1 मिनट से कम • साइन अप की ज़रूरत नहीं',
      safeTitle:         'सुरक्षित & सत्यापित',
      safeLine1:         'हम कभी आधार या बैंक विवरण नहीं मांगते',
      safeLine2:         'सभी लिंक सरकारी वेबसाइटों पर जाते हैं',
      safeLine3:         'आपका डेटा केवल आपके फ़ोन पर रहता है',
      voiceTitle:        'बोलकर योजनाएं खोजें',
      voiceHint:         'माइक दबाएं और बोलें',
      voiceListening:    'सुन रहा है…',
      voiceFinding:      'योजनाएं खोज रहा है…',
    ),
  };
}
