// lib/constants/app_constants.dart
// Static data mirroring the backend's valid value sets.
// Keep in sync with backend/models/scheme.py.

class AppConstants {
  AppConstants._();

  // ── Base URL ──────────────────────────────────────────────────
  // Change to your machine's LAN IP when running on a real device:
  //   e.g. 'http://192.168.1.10:8000'
  static const String baseUrl = 'http://10.0.2.2:8000';

  // ── Languages ────────────────────────────────────────────────
  static const List<Map<String, String>> languages = [
    {'code': 'en', 'label': 'English'},
    {'code': 'ta', 'label': 'தமிழ்'},
    {'code': 'hi', 'label': 'हिंदी'},
  ];

  // ── Indian states ────────────────────────────────────────────
  static const List<Map<String, String>> states = [
    {'code': 'AN', 'name': 'Andaman & Nicobar'},
    {'code': 'AP', 'name': 'Andhra Pradesh'},
    {'code': 'AR', 'name': 'Arunachal Pradesh'},
    {'code': 'AS', 'name': 'Assam'},
    {'code': 'BR', 'name': 'Bihar'},
    {'code': 'CG', 'name': 'Chhattisgarh'},
    {'code': 'CH', 'name': 'Chandigarh'},
    {'code': 'DD', 'name': 'Daman & Diu'},
    {'code': 'DL', 'name': 'Delhi'},
    {'code': 'DN', 'name': 'Dadra & Nagar Haveli'},
    {'code': 'GA', 'name': 'Goa'},
    {'code': 'GJ', 'name': 'Gujarat'},
    {'code': 'HP', 'name': 'Himachal Pradesh'},
    {'code': 'HR', 'name': 'Haryana'},
    {'code': 'JH', 'name': 'Jharkhand'},
    {'code': 'JK', 'name': 'Jammu & Kashmir'},
    {'code': 'KA', 'name': 'Karnataka'},
    {'code': 'KL', 'name': 'Kerala'},
    {'code': 'LA', 'name': 'Ladakh'},
    {'code': 'LD', 'name': 'Lakshadweep'},
    {'code': 'MH', 'name': 'Maharashtra'},
    {'code': 'ML', 'name': 'Meghalaya'},
    {'code': 'MN', 'name': 'Manipur'},
    {'code': 'MP', 'name': 'Madhya Pradesh'},
    {'code': 'MZ', 'name': 'Mizoram'},
    {'code': 'NL', 'name': 'Nagaland'},
    {'code': 'OD', 'name': 'Odisha'},
    {'code': 'PB', 'name': 'Punjab'},
    {'code': 'PY', 'name': 'Puducherry'},
    {'code': 'RJ', 'name': 'Rajasthan'},
    {'code': 'SK', 'name': 'Sikkim'},
    {'code': 'TN', 'name': 'Tamil Nadu'},
    {'code': 'TR', 'name': 'Tripura'},
    {'code': 'TS', 'name': 'Telangana'},
    {'code': 'UK', 'name': 'Uttarakhand'},
    {'code': 'UP', 'name': 'Uttar Pradesh'},
    {'code': 'WB', 'name': 'West Bengal'},
  ];

  // ── Genders ──────────────────────────────────────────────────
  static const List<String> genders = ['male', 'female', 'other'];

  // ── Caste categories ─────────────────────────────────────────
  static const List<String> casteCategories = [
    'SC',
    'ST',
    'OBC',
    'EWS',
    'GEN',
  ];

  // ── Occupation types ─────────────────────────────────────────
  static const List<Map<String, String>> occupations = [
    {'value': 'farmer',             'label': 'Farmer / Agriculture'},
    {'value': 'student',            'label': 'Student'},
    {'value': 'unorganised_worker', 'label': 'Daily wage / Unorganised worker'},
    {'value': 'self_employed',      'label': 'Self-employed / Small business'},
    {'value': 'unemployed',         'label': 'Unemployed / Looking for work'},
    {'value': 'salaried',           'label': 'Salaried employee'},
  ];

  // ── Income ranges ────────────────────────────────────────────
  static const List<Map<String, dynamic>> incomeRanges = [
    {'value': 60000,   'label': 'Below ₹60,000 / year'},
    {'value': 120000,  'label': '₹60,000 – ₹1,20,000'},
    {'value': 180000,  'label': '₹1,20,000 – ₹1,80,000'},
    {'value': 250000,  'label': '₹1,80,000 – ₹2,50,000'},
    {'value': 500000,  'label': '₹2,50,000 – ₹5,00,000'},
    {'value': 1000000, 'label': 'Above ₹5,00,000'},
  ];

  // ── Benefit type display config ───────────────────────────────
  // Maps benefit_type string → {label, colorHex}
  static const Map<String, Map<String, dynamic>> benefitTypes = {
    'cash_transfer':  {'label': 'Cash Transfer',  'colorHex': 0xFF1D4ED8},
    'scholarship':    {'label': 'Scholarship',    'colorHex': 0xFF15803D},
    'subsidy':        {'label': 'Subsidy',        'colorHex': 0xFF854D0E},
    'insurance':      {'label': 'Insurance',      'colorHex': 0xFF6D28D9},
    'housing':        {'label': 'Housing',        'colorHex': 0xFF9A3412},
    'employment':     {'label': 'Employment',     'colorHex': 0xFF166534},
    'healthcare':     {'label': 'Healthcare',     'colorHex': 0xFF9D174D},
    'food_subsidy':   {'label': 'Food Subsidy',   'colorHex': 0xFFC2410C},
    'savings_scheme': {'label': 'Savings',        'colorHex': 0xFF1E40AF},
    'other':          {'label': 'Scheme',         'colorHex': 0xFF374151},
  };

  // ── Speech locale codes ───────────────────────────────────────
  static const Map<String, String> speechLocales = {
    'en': 'en_IN',
    'ta': 'ta_IN',
    'hi': 'hi_IN',
  };

  // ── Voice keyword → profile field mapping ────────────────────
  // Mirrors the KEYWORD_MAP from the web app's page.jsx
  static const Map<String, String> voiceKeywordMap = {
    'tamil nadu': 'TN', 'tamilnadu': 'TN',
    'maharashtra': 'MH', 'delhi': 'DL',
    'karnataka': 'KA', 'andhra': 'AP',
    'kerala': 'KL', 'uttar pradesh': 'UP',
    'west bengal': 'WB',
    'female': 'female', 'woman': 'female', 'women': 'female',
    'male': 'male', 'man': 'male',
    'sc': 'SC', 'scheduled caste': 'SC',
    'st': 'ST', 'tribal': 'ST',
    'obc': 'OBC',
    'ews': 'EWS',
    'general': 'GEN',
    'farmer': 'farmer',
    'student': 'student',
    'labour': 'unorganised_worker', 'daily wage': 'unorganised_worker',
    'self employed': 'self_employed',
    'unemployed': 'unemployed',
    'salaried': 'salaried', 'job': 'salaried',
  };

  static const Map<String, int> voiceIncomeKeywords = {
    'poor': 60000,    'bpl': 60000,
    'low income': 120000,
    'middle': 250000,
  };
}
