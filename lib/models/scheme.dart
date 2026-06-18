// lib/models/scheme.dart
// Mirrors backend/models/scheme.py → MatchedScheme & Scheme (full record)

// ── MatchedScheme ─────────────────────────────────────────────
// Returned by POST /schemes/match and GET /schemes/semantic-search
class MatchedScheme {
  final String schemeId;
  final String name;
  final String nameEn;
  final String ministry;
  final String benefitType;
  final int? benefitAmount;
  final String? benefitFrequency;
  final String? applicationUrl;
  final String? applicationDeadline;
  final bool isRolling;
  final List<String> documentsRequired;
  // Only present in semantic-search results
  final double? similarity;

  const MatchedScheme({
    required this.schemeId,
    required this.name,
    required this.nameEn,
    required this.ministry,
    required this.benefitType,
    this.benefitAmount,
    this.benefitFrequency,
    this.applicationUrl,
    this.applicationDeadline,
    this.isRolling = true,
    this.documentsRequired = const [],
    this.similarity,
  });

  factory MatchedScheme.fromJson(Map<String, dynamic> json) {
    return MatchedScheme(
      schemeId:            json['scheme_id']            as String,
      name:                json['name']                 as String,
      nameEn:              (json['name_en'] as String?) ?? (json['name'] as String),
      ministry:            json['ministry']             as String,
      benefitType:         json['benefit_type']         as String,
      benefitAmount:       (json['benefit_amount'] as num?)?.toInt(),
      benefitFrequency:    json['benefit_frequency']    as String?,
      applicationUrl:      json['application_url']      as String?,
      applicationDeadline: json['application_deadline'] as String?,
      isRolling:           (json['is_rolling'] as bool?) ?? true,
      documentsRequired:   (json['documents_required'] as List<dynamic>?)
                               ?.map((e) => e as String)
                               .toList() ??
                           [],
      similarity:          (json['similarity'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {
    'scheme_id':            schemeId,
    'name':                 name,
    'name_en':              nameEn,
    'ministry':             ministry,
    'benefit_type':         benefitType,
    'benefit_amount':       benefitAmount,
    'benefit_frequency':    benefitFrequency,
    'application_url':      applicationUrl,
    'application_deadline': applicationDeadline,
    'is_rolling':           isRolling,
    'documents_required':   documentsRequired,
    if (similarity != null) 'similarity': similarity,
  };

  // Formatted benefit amount string, e.g. "Rs.6,000/year"
  String? get formattedAmount {
    if (benefitAmount == null) return null;
    final amount = 'Rs.${_formatNumber(benefitAmount!)}';
    final freq = switch (benefitFrequency) {
      'monthly'  => '/month',
      'annual'   => '/year',
      'one-time' => ' one-time',
      _          => '',
    };
    return '$amount$freq';
  }

  static String _formatNumber(int n) {
    // Indian number formatting: 6,00,000
    final s = n.toString();
    if (s.length <= 3) return s;
    final last3 = s.substring(s.length - 3);
    final rest = s.substring(0, s.length - 3);
    final buf = StringBuffer();
    for (var i = 0; i < rest.length; i++) {
      if (i > 0 && (rest.length - i) % 2 == 0) buf.write(',');
      buf.write(rest[i]);
    }
    return '${buf.toString()},$last3';
  }
}

// ── Full Scheme ───────────────────────────────────────────────
// Returned by GET /schemes/{scheme_id}
class Scheme {
  final String schemeId;
  final String name;
  final String? nameTa;
  final String? nameHi;
  final String ministry;
  final String benefitType;
  final int? benefitAmount;
  final String? benefitFrequency;
  final List<String>? applicableStates;
  final String? gender;
  final List<String>? casteCategories;
  final int? minAge;
  final int? maxAge;
  final int? maxIncome;
  final List<String>? occupationTypes;
  final List<String>? documentsRequired;
  final String? applicationUrl;
  final String? applicationDeadline;
  final bool isRolling;
  final bool active;
  final String? verifiedAt;
  final String? createdAt;
  final String? updatedAt;

  const Scheme({
    required this.schemeId,
    required this.name,
    this.nameTa,
    this.nameHi,
    required this.ministry,
    required this.benefitType,
    this.benefitAmount,
    this.benefitFrequency,
    this.applicableStates,
    this.gender,
    this.casteCategories,
    this.minAge,
    this.maxAge,
    this.maxIncome,
    this.occupationTypes,
    this.documentsRequired,
    this.applicationUrl,
    this.applicationDeadline,
    this.isRolling = true,
    this.active = true,
    this.verifiedAt,
    this.createdAt,
    this.updatedAt,
  });

  factory Scheme.fromJson(Map<String, dynamic> json) {
    List<String>? _strList(dynamic v) =>
        (v as List<dynamic>?)?.map((e) => e as String).toList();

    return Scheme(
      schemeId:           json['scheme_id']          as String,
      name:               json['name']               as String,
      nameTa:             json['name_ta']             as String?,
      nameHi:             json['name_hi']             as String?,
      ministry:           json['ministry']            as String,
      benefitType:        json['benefit_type']        as String,
      benefitAmount:      (json['benefit_amount'] as num?)?.toInt(),
      benefitFrequency:   json['benefit_frequency']   as String?,
      applicableStates:   _strList(json['applicable_states']),
      gender:             json['gender']              as String?,
      casteCategories:    _strList(json['caste_categories']),
      minAge:             (json['min_age'] as num?)?.toInt(),
      maxAge:             (json['max_age'] as num?)?.toInt(),
      maxIncome:          (json['max_income'] as num?)?.toInt(),
      occupationTypes:    _strList(json['occupation_types']),
      documentsRequired:  _strList(json['documents_required']),
      applicationUrl:     json['application_url']     as String?,
      applicationDeadline: json['application_deadline'] as String?,
      isRolling:          (json['is_rolling'] as bool?) ?? true,
      active:             (json['active'] as bool?)   ?? true,
      verifiedAt:         json['verified_at']         as String?,
      createdAt:          json['created_at']          as String?,
      updatedAt:          json['updated_at']          as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'scheme_id':            schemeId,
    'name':                 name,
    'name_ta':              nameTa,
    'name_hi':              nameHi,
    'ministry':             ministry,
    'benefit_type':         benefitType,
    'benefit_amount':       benefitAmount,
    'benefit_frequency':    benefitFrequency,
    'applicable_states':    applicableStates,
    'gender':               gender,
    'caste_categories':     casteCategories,
    'min_age':              minAge,
    'max_age':              maxAge,
    'max_income':           maxIncome,
    'occupation_types':     occupationTypes,
    'documents_required':   documentsRequired,
    'application_url':      applicationUrl,
    'application_deadline': applicationDeadline,
    'is_rolling':           isRolling,
    'active':               active,
  };

  /// Returns the localised name based on language code.
  String localizedName(String lang) {
    if (lang == 'ta' && nameTa != null) return nameTa!;
    if (lang == 'hi' && nameHi != null) return nameHi!;
    return name;
  }
}

// ── Eligibility check response ────────────────────────────────
// Returned by POST /schemes/check/{scheme_id}
class EligibilityCheckResult {
  final String schemeId;
  final String name;
  final bool eligible;
  final List<String> reasons;

  const EligibilityCheckResult({
    required this.schemeId,
    required this.name,
    required this.eligible,
    required this.reasons,
  });

  factory EligibilityCheckResult.fromJson(Map<String, dynamic> json) {
    return EligibilityCheckResult(
      schemeId: json['scheme_id'] as String,
      name:     json['name']      as String,
      eligible: json['eligible']  as bool,
      reasons:  (json['reasons'] as List<dynamic>)
                    .map((e) => e as String)
                    .toList(),
    );
  }
}
