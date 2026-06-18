// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Tamil (`ta`).
class AppLocalizationsTa extends AppLocalizations {
  AppLocalizationsTa([String locale = 'ta']) : super(locale);

  @override
  String get appTitle => 'நலத் திட்டங்கள்';

  @override
  String get tagline => 'நீங்கள் தகுதியான திட்டங்களை கண்டறியுங்கள்';

  @override
  String get ctaGetStarted => 'தொடங்குங்கள் — இலவசம்';

  @override
  String get ctaSeeMySchemes => 'என் திட்டங்களை பாருங்கள்';

  @override
  String get ctaUpdateProfile => 'விவரங்களை மாற்றுங்கள்';

  @override
  String get onboardingMinutes =>
      '1 நிமிடத்திற்கும் குறைவாக • பதிவு தேவையில்லை';

  @override
  String get safeTitle => 'பாதுகாப்பான & சரிபார்க்கப்பட்டது';

  @override
  String get safeLine1 => 'ஆதார் அல்லது வங்கி விவரங்களை நாங்கள் கேட்கமாட்டோம்';

  @override
  String get safeLine2 =>
      'அனைத்து இணைப்புகளும் அதிகாரப்பூர்வ அரசு தளங்களுக்கு செல்கின்றன';

  @override
  String get safeLine3 => 'உங்கள் தரவு உங்கள் தொலைபேசியில் மட்டுமே இருக்கும்';

  @override
  String get voiceTitle => 'பேசி திட்டங்கள் கண்டறியுங்கள்';

  @override
  String get voiceHint => 'மைக்கை தட்டி பேசுங்கள்';

  @override
  String get voiceListening => 'கேட்கிறது…';

  @override
  String get voiceFinding => 'திட்டங்களை தேடுகிறது…';

  @override
  String get voiceError => 'தெளிவாக கேட்கவில்லை. மீண்டும் முயற்சிக்கவும்.';

  @override
  String get voiceNotSupported =>
      'இந்த சாதனத்தில் குரல் உள்ளீடு கிடைக்கவில்லை.';

  @override
  String voiceFoundSchemes(
      int count, String state, String caste, String occupation) {
    return '$state · $caste · $occupation க்கு $count திட்டங்கள் கிடைத்தன';
  }

  @override
  String seeAllSchemes(int count) {
    return 'அனைத்து $count திட்டங்களையும் பாருங்கள் →';
  }

  @override
  String get onboardingStep1Title => 'நீங்கள் எங்கு வசிக்கிறீர்கள்?';

  @override
  String get onboardingStep1Sub =>
      'உங்கள் மாநிலத்தில் உள்ள திட்டங்களை கண்டறிய இதை பயன்படுத்துகிறோம்';

  @override
  String get onboardingStep2Title => 'உங்களை பற்றி சொல்லுங்கள்';

  @override
  String get onboardingStep2Sub => 'சரியான திட்டங்களை பொருத்த இது உதவுகிறது';

  @override
  String get onboardingStep3Title => 'உங்கள் வருமானம் & தொழில்';

  @override
  String get onboardingStep3Sub =>
      'பல திட்டங்கள் வருமானம் மற்றும் தொழிலை சார்ந்தவை';

  @override
  String get onboardingStep4Title => 'கிட்டத்தட்ட முடிந்தது!';

  @override
  String get onboardingStep4Sub =>
      'திட்டங்களை கண்டறிவதற்கு முன் உங்கள் சுயவிவரத்தை சரிபார்க்கவும்';

  @override
  String get selectState => 'உங்கள் மாநிலத்தை தேர்ந்தெடுக்கவும்';

  @override
  String get chooseState => '— மாநிலம் தேர்ந்தெடுக்கவும் —';

  @override
  String get genderLabel => 'பாலினம்';

  @override
  String get genderMale => 'ஆண்';

  @override
  String get genderFemale => 'பெண்';

  @override
  String get genderOther => 'மற்றவர்';

  @override
  String get categoryLabel => 'வகை';

  @override
  String get ageLabel => 'உங்கள் வயது';

  @override
  String get agePlaceholder => 'எ.கா. 28';

  @override
  String get incomeLabel => 'வருடாந்திர குடும்ப வருமானம்';

  @override
  String get occupationLabel => 'தொழில்';

  @override
  String get btnContinue => 'தொடரவும் →';

  @override
  String get btnFindMySchemes => 'என் திட்டங்களை கண்டறியுங்கள் 🎯';

  @override
  String get btnBack => '← பின்னே';

  @override
  String stepOf(int step, int total) {
    return '$step / $total';
  }

  @override
  String get profileSavedLocally =>
      '✅ உங்கள் சுயவிவரம் உங்கள் தொலைபேசியில் மட்டுமே சேமிக்கப்படுகிறது.';

  @override
  String get schemesTitle => 'என் திட்டங்கள்';

  @override
  String schemesSubtitle(int count) {
    return 'உங்களுக்கு பொருந்திய $count திட்டங்கள்';
  }

  @override
  String get filterAll => 'அனைத்தும்';

  @override
  String get openNow => 'இப்போது திறந்திருக்கிறது';

  @override
  String get amountVaries => 'தொகை மாறுபடும்';

  @override
  String get noSchemesTitle => 'திட்டங்கள் எதுவும் இல்லை';

  @override
  String get noSchemesSub =>
      'உங்கள் சுயவிவரத்தை மாற்றி மீண்டும் முயற்சிக்கவும்.';

  @override
  String get searchTitle => 'AI கருத்தியல் தேடல்';

  @override
  String get searchSubtitle =>
      'சரியான வார்த்தைகளுக்கு பதில் உங்கள் தேவையை விவரியுங்கள்';

  @override
  String get searchPlaceholder => 'எ.கா. ஏழை SC பெண் மாணவர் படிக்க நிதி உதவி…';

  @override
  String get searchBtn => 'திட்டங்களை தேடு';

  @override
  String get searchHint =>
      'உங்கள் பாலினம், மாநிலம், தொழில் மற்றும் என்ன உதவி தேவை என்று எழுதவும்.';

  @override
  String get searching => 'தேடலை பகுப்பாய்வு செய்கிறது…';

  @override
  String get searchNoResults =>
      'பொருந்தும் திட்டங்கள் எதுவும் இல்லை. மாற்று வார்த்தைகளில் முயற்சிக்கவும்.';

  @override
  String get searchResultsLabel => 'இந்த திட்டங்கள் பொருந்துகின்றன:';

  @override
  String matchPercent(int pct) {
    return '$pct% பொருத்தம்';
  }

  @override
  String get schemeDetailTitle => 'திட்ட விவரங்கள்';

  @override
  String get benefitLabel => 'பலன்';

  @override
  String get ministryLabel => 'அமைச்சகம்';

  @override
  String get eligibilityLabel => 'தகுதி';

  @override
  String get documentsLabel => 'தேவையான ஆவணங்கள்';

  @override
  String get applyNow => 'இப்போது விண்ணப்பிக்கவும் →';

  @override
  String get deadlineLabel => 'கடைசி தேதி';

  @override
  String get rollingLabel => 'தொடர்ந்து திறந்திருக்கும்';

  @override
  String get eligibleLabel => '✅ நீங்கள் தகுதியானவர் என்று தெரிகிறது';

  @override
  String get notEligibleLabel => '❌ நீங்கள் தகுதியற்றவராக இருக்கலாம்';

  @override
  String get profileTitle => 'என் சுயவிவரம்';

  @override
  String get profileState => 'மாநிலம்';

  @override
  String get profileGender => 'பாலினம்';

  @override
  String get profileCategory => 'வகை';

  @override
  String get profileAge => 'வயது';

  @override
  String profileAgeYears(int age) {
    return '$age வயது';
  }

  @override
  String get profileIncome => 'வருமானம்';

  @override
  String get profileOccupation => 'தொழில்';

  @override
  String get btnEditProfile => 'சுயவிவரத்தை திருத்து';

  @override
  String get btnSave => 'மாற்றங்களை சேமி';

  @override
  String get btnDeleteProfile => 'சுயவிவரத்தை நீக்கு';

  @override
  String get deleteConfirmTitle => 'சுயவிவரத்தை நீக்கவா?';

  @override
  String get deleteConfirmMsg =>
      'பொருந்திய திட்டங்களை பார்க்க மீண்டும் நிரப்ப வேண்டும்.';

  @override
  String get btnCancel => 'ரத்து செய்';

  @override
  String get btnDelete => 'நீக்கு';

  @override
  String get profileSavedToast => 'சுயவிவரம் சேமிக்கப்பட்டது!';

  @override
  String get chatTitle => 'AI திட்ட உதவியாளர்';

  @override
  String get chatSubtitle => 'தகுதி & விதிகள் பற்றி கேளுங்கள்';

  @override
  String get chatPlaceholder => 'கேள்வி கேளுங்கள்…';

  @override
  String get chatSafety =>
      'பாதுகாப்பான அரட்டை: ஆதார் அல்லது வங்கி எண்களை கேட்கமாட்டோம்.';

  @override
  String get chatRelatedSchemes =>
      'தொடர்புடைய திட்டங்கள் (விவரம் பார்க்க தட்டவும்):';

  @override
  String get chatSuggest1 => 'PM-KISAN தகுதி எனக்கு உண்டா?';

  @override
  String get chatSuggest2 => 'மாணவர்களுக்கான கல்வி உதவித்தொகை உள்ளதா?';

  @override
  String get chatSuggest3 => 'கூலித் தொழிலாளர்களுக்கு வீட்டு வசதி உள்ளதா?';

  @override
  String get chatSuggest4 => 'பெண் குழந்தைகளுக்கான SSY திட்டம்?';

  @override
  String get errorGeneric => 'ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்.';

  @override
  String get errorNoConnection => 'சேவையகத்துடன் இணைக்க முடியவில்லை.';

  @override
  String get btnRetry => 'மீண்டும் முயற்சி';

  @override
  String get navHome => 'முகப்பு';

  @override
  String get navSchemes => 'திட்டங்கள்';

  @override
  String get navSearch => 'தேடல்';

  @override
  String get navProfile => 'சுயவிவரம்';
}
