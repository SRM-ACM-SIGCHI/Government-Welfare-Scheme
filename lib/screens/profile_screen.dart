// lib/screens/profile_screen.dart
// User profile view/edit — mirrors frontend/app/profile/page.jsx.
// Reads from and writes to StorageService (no API call needed).

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../constants/app_constants.dart';
import '../constants/app_theme.dart';
import '../models/user_profile.dart';
import '../providers/profile_provider.dart';
import '../providers/schemes_provider.dart';
import '../widgets/language_switcher.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool   _editing = false;
  bool   _saved   = false;

  // Edit form state (initialised from profile in build)
  String _state        = '';
  String _gender       = '';
  String _caste        = '';
  String _ageText      = '';
  int?   _income;
  String _occupation   = '';

  final _ageController = TextEditingController();

  @override
  void dispose() {
    _ageController.dispose();
    super.dispose();
  }

  void _startEdit(UserProfile p) {
    _state      = p.state;
    _gender     = p.gender;
    _caste      = p.casteCategory;
    _ageText    = p.age.toString();
    _income     = p.incomeAnnual;
    _occupation = p.occupationType;
    _ageController.text = _ageText;
    setState(() => _editing = true);
  }

  Future<void> _save() async {
    final age = int.tryParse(_ageText);
    if (age == null || age < 1 || _state.isEmpty || _gender.isEmpty ||
        _caste.isEmpty || _income == null || _occupation.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please complete all fields')),
      );
      return;
    }

    final updated = UserProfile(
      state:          _state,
      gender:         _gender,
      casteCategory:  _caste,
      age:            age,
      incomeAnnual:   _income!,
      occupationType: _occupation,
    );
    await ref.read(profileProvider.notifier).saveProfile(updated);
    // Re-fetch schemes for updated profile
    ref.read(schemesProvider.notifier).fetchSchemes();

    if (mounted) {
      setState(() { _editing = false; _saved = true; });
      Future.delayed(
        const Duration(seconds: 2),
        () { if (mounted) setState(() => _saved = false); },
      );
    }
  }

  Future<void> _deleteProfile() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title:   const Text('Delete Profile?'),
        content: const Text(
          'You will need to fill it in again to see matched schemes.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child:     const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child:     const Text('Delete',
                style: TextStyle(color: AppTheme.error)),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await ref.read(profileProvider.notifier).deleteProfile();
      if (mounted) context.go('/');
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = ref.watch(profileProvider);

    if (profile == null) {
      WidgetsBinding.instance.addPostFrameCallback(
          (_) => context.go('/onboarding'));
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
        actions: [
          if (!_editing)
            TextButton(
              onPressed: () => _startEdit(profile),
              child: const Text('Edit'),
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Language switcher
            const LanguageSwitcher(),
            const SizedBox(height: 24),

            if (_saved)
              Container(
                width:   double.infinity,
                padding: const EdgeInsets.all(12),
                margin:  const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: AppTheme.successBg,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  '✅ Profile saved!',
                  style: TextStyle(color: AppTheme.success),
                ),
              ),

            _editing ? _buildEditForm() : _buildViewCard(profile),

            const SizedBox(height: 24),

            // Action buttons
            if (_editing) ...[
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                    onPressed: _save, child: const Text('Save Changes')),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => setState(() => _editing = false),
                  child: const Text('Cancel'),
                ),
              ),
            ] else ...[
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppTheme.error,
                    side: const BorderSide(color: AppTheme.error),
                  ),
                  onPressed: _deleteProfile,
                  child: const Text('Delete Profile'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  // ── Read-only view ─────────────────────────────────────────
  Widget _buildViewCard(UserProfile p) {
    final stateName   = AppConstants.states
        .firstWhere((s) => s['code'] == p.state,
            orElse: () => {'name': p.state})['name']!;
    final incomeLabel = AppConstants.incomeRanges
        .firstWhere((r) => r['value'] == p.incomeAnnual,
            orElse: () => {'label': '₹${p.incomeAnnual}'})['label'] as String;
    final occLabel    = AppConstants.occupations
        .firstWhere((o) => o['value'] == p.occupationType,
            orElse: () => {'label': p.occupationType})['label']!;

    final rows = [
      ('State',      stateName),
      ('Gender',     _capitalise(p.gender)),
      ('Category',   p.casteCategory),
      ('Age',        '${p.age} years'),
      ('Income',     incomeLabel),
      ('Occupation', occLabel),
    ];

    return Container(
      decoration: BoxDecoration(
        color:        Colors.white,
        border:       Border.all(color: AppTheme.border),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: rows.mapIndexed((i, r) {
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            decoration: BoxDecoration(
              border: Border(
                bottom: i < rows.length - 1
                    ? const BorderSide(color: Color(0xFFF9FAFB))
                    : BorderSide.none,
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
    );
  }

  // ── Edit form ──────────────────────────────────────────────
  Widget _buildEditForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // State
        const Text('State',
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
          onChanged: (v) => setState(() => _state = v ?? ''),
        ),
        const SizedBox(height: 16),

        // Gender
        const Text('Gender',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
        const SizedBox(height: 8),
        Row(
          children: AppConstants.genders.map((g) {
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.only(right: 8),
                child: _SelBtn(
                  label:    _capitalise(g),
                  selected: _gender == g,
                  onTap:    () => setState(() => _gender = g),
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 16),

        // Category
        const Text('Category',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: AppConstants.casteCategories.map((c) => _SelBtn(
                label:    c,
                selected: _caste == c,
                onTap:    () => setState(() => _caste = c),
              )).toList(),
        ),
        const SizedBox(height: 16),

        // Age
        const Text('Age',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
        const SizedBox(height: 8),
        TextFormField(
          controller:  _ageController,
          keyboardType: TextInputType.number,
          decoration:  const InputDecoration(hintText: 'e.g. 28'),
          onChanged:   (v) => setState(() => _ageText = v),
        ),
        const SizedBox(height: 16),

        // Income
        const Text('Annual income',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
        const SizedBox(height: 8),
        ...AppConstants.incomeRanges.map((r) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: GestureDetector(
                onTap: () => setState(() => _income = r['value'] as int),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  width:    double.infinity,
                  padding:  const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color:  _income == r['value']
                        ? const Color(0xFFEFF6FF)
                        : Colors.white,
                    border: Border.all(
                        color: _income == r['value']
                            ? AppTheme.primary
                            : AppTheme.border),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(r['label'] as String,
                      style: TextStyle(
                        fontSize:   14,
                        fontWeight: _income == r['value']
                            ? FontWeight.w500
                            : FontWeight.w400,
                        color: _income == r['value']
                            ? AppTheme.primaryDark
                            : const Color(0xFF374151),
                      )),
                ),
              ),
            )),
        const SizedBox(height: 8),

        // Occupation
        const Text('Occupation',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
        const SizedBox(height: 8),
        ...AppConstants.occupations.map((o) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: GestureDetector(
                onTap: () => setState(() => _occupation = o['value']!),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  width:    double.infinity,
                  padding:  const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color:  _occupation == o['value']
                        ? const Color(0xFFEFF6FF)
                        : Colors.white,
                    border: Border.all(
                        color: _occupation == o['value']
                            ? AppTheme.primary
                            : AppTheme.border),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(o['label']!,
                      style: TextStyle(
                        fontSize:   14,
                        fontWeight: _occupation == o['value']
                            ? FontWeight.w500
                            : FontWeight.w400,
                        color: _occupation == o['value']
                            ? AppTheme.primaryDark
                            : const Color(0xFF374151),
                      )),
                ),
              ),
            )),
      ],
    );
  }

  static String _capitalise(String s) =>
      s.isEmpty ? s : '${s[0].toUpperCase()}${s.substring(1)}';
}

class _SelBtn extends StatelessWidget {
  final String       label;
  final bool         selected;
  final VoidCallback onTap;

  const _SelBtn({
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
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        decoration: BoxDecoration(
          color:        selected ? AppTheme.primary : Colors.white,
          border:       Border.all(
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

extension<T> on List<T> {
  Iterable<R> mapIndexed<R>(R Function(int i, T e) f) sync* {
    var i = 0;
    for (final e in this) yield f(i++, e);
  }
}
