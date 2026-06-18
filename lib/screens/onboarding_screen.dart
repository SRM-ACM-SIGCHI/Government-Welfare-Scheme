// lib/screens/onboarding_screen.dart
// 4-step onboarding wizard — mirrors frontend/app/onboarding/page.jsx exactly.
// Step 1: State | Step 2: Gender, Category, Age | Step 3: Income, Occupation | Step 4: Review

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../constants/app_constants.dart';
import '../constants/app_theme.dart';
import '../models/user_profile.dart';
import '../providers/language_provider.dart';
import '../providers/profile_provider.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  int _step = 1;

  // Form fields
  String _state         = '';
  String _gender        = '';
  String _caste         = '';
  String _ageText       = '';
  int?   _income;
  String _occupation    = '';

  // Validation errors
  String _errState = '';
  String _errGender = '';
  String _errCaste = '';
  String _errAge = '';
  String _errIncome = '';
  String _errOcc = '';

  final _ageController = TextEditingController();

  @override
  void dispose() {
    _ageController.dispose();
    super.dispose();
  }

  bool _validateStep() {
    setState(() {
      _errState  = '';
      _errGender = '';
      _errCaste  = '';
      _errAge    = '';
      _errIncome = '';
      _errOcc    = '';
    });

    bool ok = true;
    if (_step == 1 && _state.isEmpty) {
      setState(() => _errState = 'Please select your state');
      ok = false;
    }
    if (_step == 2) {
      if (_gender.isEmpty) { setState(() => _errGender = 'Please select gender');   ok = false; }
      if (_caste.isEmpty)  { setState(() => _errCaste  = 'Please select category'); ok = false; }
      final age = int.tryParse(_ageText);
      if (age == null || age < 1 || age > 120) {
        setState(() => _errAge = 'Please enter a valid age (1–120)');
        ok = false;
      }
    }
    if (_step == 3) {
      if (_income == null)      { setState(() => _errIncome = 'Please select income range'); ok = false; }
      if (_occupation.isEmpty)  { setState(() => _errOcc    = 'Please select occupation');   ok = false; }
    }
    return ok;
  }

  void _next() {
    if (_validateStep()) setState(() => _step = (_step + 1).clamp(1, 4));
  }

  void _back() => setState(() => _step = (_step - 1).clamp(1, 4));

  Future<void> _submit() async {
    final profile = UserProfile(
      state:          _state,
      gender:         _gender,
      casteCategory:  _caste,
      age:            int.parse(_ageText),
      incomeAnnual:   _income!,
      occupationType: _occupation,
    );
    await ref.read(profileProvider.notifier).saveProfile(profile);
    if (mounted) context.go('/schemes');
  }

  @override
  Widget build(BuildContext context) {
    final titles = [
      ('Where do you live?',     'We use this to find schemes in your state'),
      ('Tell us about yourself', 'This helps us match the right schemes'),
      ('Your income & work',     'Many schemes depend on income and occupation'),
      ('Almost done!',           'Review your profile before we find your schemes'),
    ];
    final (title, subtitle) = titles[_step - 1];

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Column(
          children: [
            // ── Progress bar ──────────────────────────────
            LinearProgressIndicator(
              value:            (_step - 1) / 3,
              minHeight:        4,
              backgroundColor:  const Color(0xFFF3F4F6),
              valueColor:       const AlwaysStoppedAnimation(AppTheme.primary),
            ),

            // ── Header ────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      if (_step > 1)
                        TextButton(
                          onPressed: _back,
                          child: const Text('← Back',
                              style: TextStyle(color: AppTheme.textMuted)),
                        )
                      else
                        const SizedBox(width: 64),
                      Text(
                        '$_step of 4',
                        style: const TextStyle(
                            fontSize: 14, color: AppTheme.textMuted),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(title,
                      style: const TextStyle(
                          fontSize: 24, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 4),
                  Text(subtitle,
                      style: const TextStyle(
                          fontSize: 14, color: AppTheme.textMuted)),
                ],
              ),
            ),

            // ── Step content ──────────────────────────────
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
                child: _buildStep(),
              ),
            ),

            // ── CTA ──────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _step < 4 ? _next : _submit,
                  child: Text(
                    _step < 4 ? 'Continue →' : 'Find My Schemes 🎯',
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep() {
    return switch (_step) {
      1 => _StepState(error: _errState, child: _buildStep1()),
      2 => _buildStep2(),
      3 => _buildStep3(),
      4 => _buildStep4(),
      _ => const SizedBox(),
    };
  }

  // ── Step 1: State ──────────────────────────────────────────
  Widget _buildStep1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Select your state',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: _state.isEmpty ? null : _state,
          decoration: const InputDecoration(hintText: '— Choose state —'),
          items: AppConstants.states
              .map((s) => DropdownMenuItem(
                    value: s['code'],
                    child: Text(s['name']!),
                  ))
              .toList(),
          onChanged: (v) => setState(() {
            _state = v ?? '';
            _errState = '';
          }),
        ),
        if (_errState.isNotEmpty)
          _ErrorText(_errState),
      ],
    );
  }

  // ── Step 2: Gender, Category, Age ──────────────────────────
  Widget _buildStep2() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Gender
        const Text('Gender',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
        const SizedBox(height: 8),
        Row(
          children: AppConstants.genders.map((g) {
            final active = _gender == g;
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.only(right: 8),
                child: _SelectButton(
                  label:    _capitalise(g),
                  selected: active,
                  onTap:    () => setState(() { _gender = g; _errGender = ''; }),
                ),
              ),
            );
          }).toList(),
        ),
        if (_errGender.isNotEmpty) _ErrorText(_errGender),
        const SizedBox(height: 20),

        // Category
        const Text('Category',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: AppConstants.casteCategories.map((c) => _SelectButton(
                label:    c,
                selected: _caste == c,
                onTap:    () => setState(() { _caste = c; _errCaste = ''; }),
              )).toList(),
        ),
        if (_errCaste.isNotEmpty) _ErrorText(_errCaste),
        const SizedBox(height: 20),

        // Age
        const Text('Your age',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
        const SizedBox(height: 8),
        TextFormField(
          controller:  _ageController,
          keyboardType: TextInputType.number,
          decoration:  const InputDecoration(hintText: 'e.g. 28'),
          onChanged:   (v) => setState(() { _ageText = v; _errAge = ''; }),
        ),
        if (_errAge.isNotEmpty) _ErrorText(_errAge),
      ],
    );
  }

  // ── Step 3: Income, Occupation ─────────────────────────────
  Widget _buildStep3() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Income
        const Text('Annual household income',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
        const SizedBox(height: 8),
        ...AppConstants.incomeRanges.map((r) {
          final active = _income == r['value'];
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: GestureDetector(
              onTap: () => setState(() { _income = r['value'] as int; _errIncome = ''; }),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                width:   double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: active ? const Color(0xFFEFF6FF) : Colors.white,
                  border: Border.all(
                    color: active ? AppTheme.primary : AppTheme.border,
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  r['label'] as String,
                  style: TextStyle(
                    fontSize:   14,
                    fontWeight: active ? FontWeight.w500 : FontWeight.w400,
                    color:      active ? AppTheme.primaryDark : const Color(0xFF374151),
                  ),
                ),
              ),
            ),
          );
        }),
        if (_errIncome.isNotEmpty) _ErrorText(_errIncome),
        const SizedBox(height: 8),

        // Occupation
        const Text('Occupation',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
        const SizedBox(height: 8),
        ...AppConstants.occupations.map((o) {
          final active = _occupation == o['value'];
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: GestureDetector(
              onTap: () => setState(() { _occupation = o['value']!; _errOcc = ''; }),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                width:   double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: active ? const Color(0xFFEFF6FF) : Colors.white,
                  border: Border.all(
                    color: active ? AppTheme.primary : AppTheme.border,
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  o['label']!,
                  style: TextStyle(
                    fontSize:   14,
                    fontWeight: active ? FontWeight.w500 : FontWeight.w400,
                    color:      active ? AppTheme.primaryDark : const Color(0xFF374151),
                  ),
                ),
              ),
            ),
          );
        }),
        if (_errOcc.isNotEmpty) _ErrorText(_errOcc),
      ],
    );
  }

  // ── Step 4: Review ─────────────────────────────────────────
  Widget _buildStep4() {
    final stateName  = AppConstants.states
        .firstWhere((s) => s['code'] == _state, orElse: () => {'name': _state})['name']!;
    final incomeLabel = AppConstants.incomeRanges
        .firstWhere((r) => r['value'] == _income,
            orElse: () => {'label': '₹$_income'})['label'] as String;
    final occLabel   = AppConstants.occupations
        .firstWhere((o) => o['value'] == _occupation,
            orElse: () => {'label': _occupation})['label']!;

    final rows = [
      ('State',      stateName),
      ('Gender',     _capitalise(_gender)),
      ('Category',   _caste),
      ('Age',        '$_ageText years'),
      ('Income',     incomeLabel),
      ('Occupation', occLabel),
    ];

    return Column(
      children: [
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(color: AppTheme.border),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            children: rows.map((r) {
              return Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 20, vertical: 14),
                decoration: const BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: Color(0xFFF9FAFB)),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(r.$1,
                        style: const TextStyle(
                            fontSize: 14, color: AppTheme.textMuted)),
                    Text(r.$2,
                        style: const TextStyle(
                            fontSize: 14, fontWeight: FontWeight.w500)),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppTheme.successBg,
            border: Border.all(color: const Color(0xFFDCFCE7)),
            borderRadius: BorderRadius.circular(16),
          ),
          child: const Text(
            '✅ Your profile is saved only on your phone. We never upload it.',
            style: TextStyle(fontSize: 14, color: Color(0xFF166534)),
          ),
        ),
      ],
    );
  }

  static String _capitalise(String s) =>
      s.isEmpty ? s : '${s[0].toUpperCase()}${s.substring(1)}';
}

// ── Helpers ───────────────────────────────────────────────────

class _SelectButton extends StatelessWidget {
  final String       label;
  final bool         selected;
  final VoidCallback onTap;

  const _SelectButton({
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
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: selected ? AppTheme.primary : Colors.white,
          border: Border.all(
              color: selected ? AppTheme.primary : AppTheme.border),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              fontSize:   14,
              fontWeight: FontWeight.w500,
              color:      selected ? Colors.white : const Color(0xFF374151),
            ),
          ),
        ),
      ),
    );
  }
}

class _ErrorText extends StatelessWidget {
  final String text;
  const _ErrorText(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 4),
      child: Text(
        text,
        style: const TextStyle(fontSize: 13, color: AppTheme.error),
      ),
    );
  }
}

class _StepState extends StatelessWidget {
  final String error;
  final Widget child;
  const _StepState({required this.error, required this.child});

  @override
  Widget build(BuildContext context) => child;
}
