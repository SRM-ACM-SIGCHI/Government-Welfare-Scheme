// lib/models/user_profile.dart
// Mirrors backend/models/scheme.py → UserProfile

class UserProfile {
  final String state;
  final String gender;
  final String casteCategory;
  final int age;
  final int incomeAnnual;
  final String occupationType;

  const UserProfile({
    required this.state,
    required this.gender,
    required this.casteCategory,
    required this.age,
    required this.incomeAnnual,
    required this.occupationType,
  });

  // ── Serialisation ─────────────────────────────────────────────
  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      state:          json['state']           as String,
      gender:         json['gender']          as String,
      casteCategory:  json['caste_category']  as String,
      age:            (json['age'] as num).toInt(),
      incomeAnnual:   (json['income_annual'] as num).toInt(),
      occupationType: json['occupation_type'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
    'state':          state,
    'gender':         gender,
    'caste_category': casteCategory,
    'age':            age,
    'income_annual':  incomeAnnual,
    'occupation_type': occupationType,
  };

  // ── Convenience ───────────────────────────────────────────────
  UserProfile copyWith({
    String? state,
    String? gender,
    String? casteCategory,
    int? age,
    int? incomeAnnual,
    String? occupationType,
  }) {
    return UserProfile(
      state:          state          ?? this.state,
      gender:         gender         ?? this.gender,
      casteCategory:  casteCategory  ?? this.casteCategory,
      age:            age            ?? this.age,
      incomeAnnual:   incomeAnnual   ?? this.incomeAnnual,
      occupationType: occupationType ?? this.occupationType,
    );
  }

  @override
  String toString() =>
      'UserProfile(state: $state, gender: $gender, caste: $casteCategory, '
      'age: $age, income: $incomeAnnual, occ: $occupationType)';
}
