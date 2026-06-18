// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Welfare Schemes';

  @override
  String get tagline => 'Find government schemes you are eligible for';

  @override
  String get ctaGetStarted => 'Get Started — Free';

  @override
  String get ctaSeeMySchemes => 'See My Schemes';

  @override
  String get ctaUpdateProfile => 'Update My Profile';

  @override
  String get onboardingMinutes =>
      'Takes less than 1 minute • No sign up required';

  @override
  String get safeTitle => 'Safe & Verified';

  @override
  String get safeLine1 => 'We never ask for Aadhaar or bank details';

  @override
  String get safeLine2 => 'All links go to official government sites';

  @override
  String get safeLine3 => 'Your data stays on your phone';

  @override
  String get voiceTitle => 'Speak to find schemes';

  @override
  String get voiceHint => 'Tap mic and speak your details';

  @override
  String get voiceListening => 'Listening…';

  @override
  String get voiceFinding => 'Finding schemes…';

  @override
  String get voiceError => 'Could not hear clearly. Please try again.';

  @override
  String get voiceNotSupported => 'Voice input not available on this device.';

  @override
  String voiceFoundSchemes(
      int count, String state, String caste, String occupation) {
    return 'Found $count scheme(s) for $state · $caste · $occupation';
  }

  @override
  String seeAllSchemes(int count) {
    return 'See all $count schemes →';
  }

  @override
  String get onboardingStep1Title => 'Where do you live?';

  @override
  String get onboardingStep1Sub => 'We use this to find schemes in your state';

  @override
  String get onboardingStep2Title => 'Tell us about yourself';

  @override
  String get onboardingStep2Sub => 'This helps us match the right schemes';

  @override
  String get onboardingStep3Title => 'Your income & work';

  @override
  String get onboardingStep3Sub =>
      'Many schemes depend on income and occupation';

  @override
  String get onboardingStep4Title => 'Almost done!';

  @override
  String get onboardingStep4Sub =>
      'Review your profile before we find your schemes';

  @override
  String get selectState => 'Select your state';

  @override
  String get chooseState => '— Choose state —';

  @override
  String get genderLabel => 'Gender';

  @override
  String get genderMale => 'Male';

  @override
  String get genderFemale => 'Female';

  @override
  String get genderOther => 'Other';

  @override
  String get categoryLabel => 'Category';

  @override
  String get ageLabel => 'Your age';

  @override
  String get agePlaceholder => 'e.g. 28';

  @override
  String get incomeLabel => 'Annual household income';

  @override
  String get occupationLabel => 'Occupation';

  @override
  String get btnContinue => 'Continue →';

  @override
  String get btnFindMySchemes => 'Find My Schemes 🎯';

  @override
  String get btnBack => '← Back';

  @override
  String stepOf(int step, int total) {
    return '$step of $total';
  }

  @override
  String get profileSavedLocally =>
      '✅ Your profile is saved only on your phone. We never upload it.';

  @override
  String get schemesTitle => 'My Schemes';

  @override
  String schemesSubtitle(int count) {
    return '$count schemes matched for you';
  }

  @override
  String get filterAll => 'All';

  @override
  String get openNow => 'Open now';

  @override
  String get amountVaries => 'Amount varies';

  @override
  String get noSchemesTitle => 'No schemes found';

  @override
  String get noSchemesSub =>
      'Try updating your profile or checking back later.';

  @override
  String get searchTitle => 'AI Semantic Search';

  @override
  String get searchSubtitle =>
      'Search by intent or situation instead of exact keywords';

  @override
  String get searchPlaceholder =>
      'e.g. financial aid for poor SC female student to study…';

  @override
  String get searchBtn => 'Search Schemes';

  @override
  String get searchHint =>
      'Try typing your gender, state, occupation, and what help you need.';

  @override
  String get searching => 'Analysing query & matching schemes…';

  @override
  String get searchNoResults =>
      'No schemes matched your search. Try describing your situation differently.';

  @override
  String get searchResultsLabel => 'Schemes found by intent match:';

  @override
  String matchPercent(int pct) {
    return '$pct% Match';
  }

  @override
  String get schemeDetailTitle => 'Scheme Details';

  @override
  String get benefitLabel => 'Benefit';

  @override
  String get ministryLabel => 'Ministry';

  @override
  String get eligibilityLabel => 'Eligibility';

  @override
  String get documentsLabel => 'Documents Required';

  @override
  String get applyNow => 'Apply Now →';

  @override
  String get deadlineLabel => 'Deadline';

  @override
  String get rollingLabel => 'Rolling / Always open';

  @override
  String get eligibleLabel => '✅ You appear eligible';

  @override
  String get notEligibleLabel => '❌ You may not be eligible';

  @override
  String get profileTitle => 'My Profile';

  @override
  String get profileState => 'State';

  @override
  String get profileGender => 'Gender';

  @override
  String get profileCategory => 'Category';

  @override
  String get profileAge => 'Age';

  @override
  String profileAgeYears(int age) {
    return '$age years';
  }

  @override
  String get profileIncome => 'Income';

  @override
  String get profileOccupation => 'Occupation';

  @override
  String get btnEditProfile => 'Edit Profile';

  @override
  String get btnSave => 'Save Changes';

  @override
  String get btnDeleteProfile => 'Delete Profile';

  @override
  String get deleteConfirmTitle => 'Delete Profile?';

  @override
  String get deleteConfirmMsg =>
      'You will need to fill it in again to see matched schemes.';

  @override
  String get btnCancel => 'Cancel';

  @override
  String get btnDelete => 'Delete';

  @override
  String get profileSavedToast => 'Profile saved!';

  @override
  String get chatTitle => 'AI Scheme Assistant';

  @override
  String get chatSubtitle => 'Ask about welfare eligibility & rules';

  @override
  String get chatPlaceholder => 'Type a question…';

  @override
  String get chatSafety =>
      'Safe Chat: We never ask for Aadhaar or bank details.';

  @override
  String get chatRelatedSchemes => 'Related schemes (tap to view details):';

  @override
  String get chatSuggest1 => 'Am I eligible for PM-KISAN?';

  @override
  String get chatSuggest2 => 'Are there scholarships for students?';

  @override
  String get chatSuggest3 => 'Housing support for daily wage workers?';

  @override
  String get chatSuggest4 => 'SSY requirements for girls?';

  @override
  String get errorGeneric => 'Something went wrong. Please try again.';

  @override
  String get errorNoConnection =>
      'Could not connect to server. Check your connection.';

  @override
  String get btnRetry => 'Retry';

  @override
  String get navHome => 'Home';

  @override
  String get navSchemes => 'Schemes';

  @override
  String get navSearch => 'Search';

  @override
  String get navProfile => 'Profile';
}
