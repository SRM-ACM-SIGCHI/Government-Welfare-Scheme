// lib/widgets/scheme_card.dart
// Reusable scheme card matching the web app's SchemeCard component.

import 'package:flutter/material.dart';

import '../constants/app_constants.dart';
import '../constants/app_theme.dart';
import '../models/scheme.dart';

class SchemeCard extends StatelessWidget {
  final MatchedScheme scheme;
  final VoidCallback onTap;

  const SchemeCard({
    super.key,
    required this.scheme,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final bt = AppConstants.benefitTypes[scheme.benefitType]
        ?? AppConstants.benefitTypes['other']!;
    final color = Color(bt['colorHex'] as int);
    final bgColor = color.withOpacity(0.1);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Header row ──────────────────────────────
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      scheme.name,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.onBackground,
                        height: 1.4,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      _Badge(label: bt['label'] as String, color: color, bg: bgColor),
                      if (scheme.similarity != null) ...[
                        const SizedBox(height: 4),
                        _Badge(
                          label: '${(scheme.similarity! * 100).round()}% Match',
                          color: AppTheme.success,
                          bg: AppTheme.successBg,
                        ),
                      ],
                    ],
                  ),
                ],
              ),

              // ── Ministry ─────────────────────────────────
              const SizedBox(height: 6),
              Text(
                scheme.ministry,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppTheme.textMuted,
                ),
              ),

              // ── Amount row ───────────────────────────────
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: scheme.formattedAmount != null
                        ? Text(
                            scheme.formattedAmount!,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.primary,
                            ),
                          )
                        : const Text(
                            'Amount varies',
                            style: TextStyle(
                              fontSize: 13,
                              color: AppTheme.textMuted,
                            ),
                          ),
                  ),
                  if (scheme.isRolling && scheme.applicationDeadline == null)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: AppTheme.successBg,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'Open now',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppTheme.success,
                        ),
                      ),
                    ),
                  const SizedBox(width: 8),
                  const Icon(
                    Icons.chevron_right,
                    color: AppTheme.textMuted,
                    size: 20,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Small badge pill ──────────────────────────────────────────
class _Badge extends StatelessWidget {
  final String label;
  final Color color;
  final Color bg;

  const _Badge({
    required this.label,
    required this.color,
    required this.bg,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}
