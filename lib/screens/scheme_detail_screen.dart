// lib/screens/scheme_detail_screen.dart
// Full scheme detail — mirrors frontend/app/schemes/[id]/page.jsx.
// Connects to GET /schemes/{scheme_id}.
// Shows: benefit, ministry, eligibility constraints, documents, apply link.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../constants/app_constants.dart';
import '../constants/app_theme.dart';
import '../models/scheme.dart';
import '../providers/language_provider.dart';
import '../providers/profile_provider.dart';
import '../providers/schemes_provider.dart';

// ── Document label map (mirrors web app DOC_LABELS) ──────────
const _docLabels = {
  'aadhaar':               'Aadhaar Card',
  'ration_card':           'Ration Card',
  'bank_passbook':         'Bank Passbook',
  'caste_certificate':     'Caste Certificate',
  'income_certificate':    'Income Certificate',
  'land_records':          'Land Records',
  'mark_sheet':            'Mark Sheet / Certificates',
  'birth_certificate':     'Birth Certificate',
  'guardian_id':           'Guardian ID Proof',
  'education_certificate': 'Education Certificate',
  'project_report':        'Project Report',
  'mobile_number':         'Mobile Number',
  'bpl_card':              'BPL Card',
  'none_required':         'No documents required',
};

class SchemeDetailScreen extends ConsumerStatefulWidget {
  final String schemeId;
  const SchemeDetailScreen({super.key, required this.schemeId});

  @override
  ConsumerState<SchemeDetailScreen> createState() =>
      _SchemeDetailScreenState();
}

class _SchemeDetailScreenState extends ConsumerState<SchemeDetailScreen> {
  Scheme?  _scheme;
  bool     _loading = true;
  String?  _error;

  EligibilityCheckResult? _eligibility;
  bool _checkingEligibility = false;

  @override
  void initState() {
    super.initState();
    _fetchScheme();
  }

  Future<void> _fetchScheme() async {
    setState(() { _loading = true; _error = null; });
    try {
      final scheme = await ref
          .read(apiServiceProvider)
          .getSchemeDetails(widget.schemeId);
      setState(() => _scheme = scheme);
      // Auto-check eligibility if profile exists
      _checkEligibility(scheme);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _checkEligibility(Scheme scheme) async {
    final profile = ref.read(profileProvider);
    if (profile == null) return;
    setState(() => _checkingEligibility = true);
    try {
      final result = await ref.read(apiServiceProvider).checkEligibility(
        scheme.schemeId,
        profile,
      );
      if (mounted) setState(() => _eligibility = result);
    } catch (_) {
      // Non-fatal: eligibility check is informational
    } finally {
      if (mounted) setState(() => _checkingEligibility = false);
    }
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_error != null) {
      return Scaffold(
        appBar: AppBar(),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('😕', style: TextStyle(fontSize: 48)),
              const SizedBox(height: 12),
              const Text('Scheme not found',
                  style: TextStyle(
                      fontSize: 18, fontWeight: FontWeight.w600)),
              const SizedBox(height: 16),
              ElevatedButton(
                  onPressed: Navigator.of(context).pop,
                  child: const Text('Go back')),
            ],
          ),
        ),
      );
    }

    final scheme = _scheme!;
    final lang   = ref.watch(languageProvider);
    final bt     = AppConstants.benefitTypes[scheme.benefitType]
        ?? AppConstants.benefitTypes['other']!;
    final color  = Color(bt['colorHex'] as int);

    return Scaffold(
      appBar: AppBar(title: const Text('Scheme Details')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Badge + name ─────────────────────────────
            _Badge(label: bt['label'] as String, color: color),
            const SizedBox(height: 12),
            Text(
              scheme.localizedName(lang),
              style: const TextStyle(
                fontSize:   22,
                fontWeight: FontWeight.w700,
                color:      AppTheme.onBackground,
                height:     1.3,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              scheme.ministry,
              style: const TextStyle(
                  fontSize: 14, color: AppTheme.textMuted),
            ),

            const SizedBox(height: 20),

            // ── Eligibility banner ────────────────────────
            if (_checkingEligibility)
              const LinearProgressIndicator()
            else if (_eligibility != null)
              _EligibilityBanner(result: _eligibility!),

            const SizedBox(height: 16),

            // ── Benefit ───────────────────────────────────
            _Section(
              title: 'Benefit',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (scheme.benefitAmount != null)
                    Text(
                      'Rs.${scheme.benefitAmount!.toLocaleString()}${_freqSuffix(scheme.benefitFrequency)}',
                      style: const TextStyle(
                        fontSize:   24,
                        fontWeight: FontWeight.w700,
                        color:      AppTheme.primary,
                      ),
                    ),
                  if (scheme.benefitFrequency != null)
                    Text(
                      _freqLabel(scheme.benefitFrequency!),
                      style: const TextStyle(
                          fontSize: 13, color: AppTheme.textMuted),
                    ),
                  if (scheme.isRolling)
                    const _OpenNowBadge(),
                  if (scheme.applicationDeadline != null)
                    _InfoRow(
                        label: 'Deadline',
                        value: scheme.applicationDeadline!),
                ],
              ),
            ),

            // ── Eligibility criteria ──────────────────────
            _Section(
              title: 'Eligibility',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (scheme.gender != null && scheme.gender != 'any')
                    _InfoRow(label: 'Gender',   value: _capitalise(scheme.gender!)),
                  if (scheme.casteCategories != null &&
                      scheme.casteCategories!.isNotEmpty)
                    _InfoRow(
                        label: 'Categories',
                        value: scheme.casteCategories!.join(', ')),
                  if (scheme.minAge != null || scheme.maxAge != null)
                    _InfoRow(
                        label: 'Age',
                        value: _ageRange(scheme.minAge, scheme.maxAge)),
                  if (scheme.maxIncome != null)
                    _InfoRow(
                        label: 'Max income',
                        value: 'Rs.${scheme.maxIncome!.toLocaleString()}/year'),
                  if (scheme.applicableStates != null &&
                      !scheme.applicableStates!.contains('All'))
                    _InfoRow(
                        label: 'States',
                        value: scheme.applicableStates!.join(', ')),
                  if (scheme.occupationTypes != null &&
                      !scheme.occupationTypes!.contains('All'))
                    _InfoRow(
                        label: 'Occupation',
                        value: scheme.occupationTypes!.join(', ')),
                ],
              ),
            ),

            // ── Documents ────────────────────────────────
            if (scheme.documentsRequired != null &&
                scheme.documentsRequired!.isNotEmpty)
              _Section(
                title: 'Documents Required',
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: scheme.documentsRequired!
                      .map((d) => Padding(
                            padding: const EdgeInsets.symmetric(vertical: 3),
                            child: Row(
                              children: [
                                const Icon(Icons.check_circle_outline,
                                    size: 16,
                                    color: AppTheme.success),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    _docLabels[d.toLowerCase()] ?? d,
                                    style: const TextStyle(fontSize: 14),
                                  ),
                                ),
                              ],
                            ),
                          ))
                      .toList(),
                ),
              ),

            const SizedBox(height: 24),

            // ── Apply button ──────────────────────────────
            if (scheme.applicationUrl != null &&
                scheme.applicationUrl!.isNotEmpty)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => _launchUrl(scheme.applicationUrl!),
                  child: const Text('Apply Now →'),
                ),
              ),

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  static String _freqSuffix(String? f) => switch (f) {
        'monthly'  => '/month',
        'annual'   => '/year',
        'one-time' => ' one-time',
        _          => '',
      };

  static String _freqLabel(String f) => switch (f) {
        'monthly'  => 'Paid every month',
        'annual'   => 'Paid every year',
        'one-time' => 'One-time payment',
        _          => f,
      };

  static String _ageRange(int? min, int? max) {
    if (min != null && max != null) return '$min – $max years';
    if (min != null) return '$min+ years';
    if (max != null) return 'Up to $max years';
    return 'Any age';
  }

  static String _capitalise(String s) =>
      s.isEmpty ? s : '${s[0].toUpperCase()}${s.substring(1)}';
}

// ── Sub-widgets ───────────────────────────────────────────────

class _Badge extends StatelessWidget {
  final String label;
  final Color  color;
  const _Badge({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color:        color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
            fontSize: 12, fontWeight: FontWeight.w600, color: color),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String title;
  final Widget child;
  const _Section({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title,
              style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textMuted,
                  letterSpacing: 0.5)),
          const SizedBox(height: 8),
          child,
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(label,
                style: const TextStyle(
                    fontSize: 13, color: AppTheme.textMuted)),
          ),
          Expanded(
            child: Text(value,
                style: const TextStyle(
                    fontSize: 13, fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }
}

class _OpenNowBadge extends StatelessWidget {
  const _OpenNowBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color:        AppTheme.successBg,
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Text(
        '✅ Open now — Rolling applications',
        style: TextStyle(fontSize: 12, color: AppTheme.success),
      ),
    );
  }
}

class _EligibilityBanner extends StatelessWidget {
  final EligibilityCheckResult result;
  const _EligibilityBanner({required this.result});

  @override
  Widget build(BuildContext context) {
    final eligible = result.eligible;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: eligible
            ? AppTheme.successBg
            : const Color(0xFFFEF2F2),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
            color: eligible
                ? const Color(0xFFDCFCE7)
                : const Color(0xFFFECACA)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            eligible
                ? '✅ You appear eligible'
                : '❌ You may not be eligible',
            style: TextStyle(
              fontSize:   14,
              fontWeight: FontWeight.w600,
              color:      eligible
                  ? AppTheme.success
                  : AppTheme.error,
            ),
          ),
          if (!eligible && result.reasons.isNotEmpty) ...[
            const SizedBox(height: 8),
            ...result.reasons.map((r) => Text(
                  '• $r',
                  style: const TextStyle(
                      fontSize: 13, color: AppTheme.error),
                )),
          ],
        ],
      ),
    );
  }
}

extension on int {
  // Indian locale number formatting
  String toLocaleString() {
    final s = toString();
    if (s.length <= 3) return s;
    final last3 = s.substring(s.length - 3);
    final rest  = s.substring(0, s.length - 3);
    final buf   = StringBuffer();
    for (var i = 0; i < rest.length; i++) {
      if (i > 0 && (rest.length - i) % 2 == 0) buf.write(',');
      buf.write(rest[i]);
    }
    return '${buf.toString()},$last3';
  }
}
