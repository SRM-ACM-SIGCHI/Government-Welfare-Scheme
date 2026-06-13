import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_hi.dart';
import 'app_localizations_ta.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
      : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('hi'),
    Locale('ta')
  ];

  /// App bar title
  ///
  /// In en, this message translates to:
  /// **'Welfare Schemes'**
  String get appTitle;

  /// No description provided for @tagline.
  ///
  /// In en, this message translates to:
  /// **'Find government schemes you are eligible for'**
  String get tagline;

  /// No description provided for @ctaGetStarted.
  ///
  /// In en, this message translates to:
  /// **'Get Started — Free'**
  String get ctaGetStarted;

  /// No description provided for @ctaSeeMySchemes.
  ///
  /// In en, this message translates to:
  /// **'See My Schemes'**
  String get ctaSeeMySchemes;

  /// No description provided for @ctaUpdateProfile.
  ///
  /// In en, this message translates to:
  /// **'Update My Profile'**
  String get ctaUpdateProfile;

  /// No description provided for @onboardingMinutes.
  ///
  /// In en, this message translates to:
  /// **'Takes less than 1 minute • No sign up required'**
  String get onboardingMinutes;

  /// No description provided for @safeTitle.
  ///
  /// In en, this message translates to:
  /// **'Safe & Verified'**
  String get safeTitle;

  /// No description provided for @safeLine1.
  ///
  /// In en, this message translates to:
  /// **'We never ask for Aadhaar or bank details'**
  String get safeLine1;

  /// No description provided for @safeLine2.
  ///
  /// In en, this message translates to:
  /// **'All links go to official government sites'**
  String get safeLine2;

  /// No description provided for @safeLine3.
  ///
  /// In en, this message translates to:
  /// **'Your data stays on your phone'**
  String get safeLine3;

  /// No description provided for @voiceTitle.
  ///
  /// In en, this message translates to:
  /// **'Speak to find schemes'**
  String get voiceTitle;

  /// No description provided for @voiceHint.
  ///
  /// In en, this message translates to:
  /// **'Tap mic and speak your details'**
  String get voiceHint;

  /// No description provided for @voiceListening.
  ///
  /// In en, this message translates to:
  /// **'Listening…'**
  String get voiceListening;

  /// No description provided for @voiceFinding.
  ///
  /// In en, this message translates to:
  /// **'Finding schemes…'**
  String get voiceFinding;

  /// No description provided for @voiceError.
  ///
  /// In en, this message translates to:
  /// **'Could not hear clearly. Please try again.'**
  String get voiceError;

  /// No description provided for @voiceNotSupported.
  ///
  /// In en, this message translates to:
  /// **'Voice input not available on this device.'**
  String get voiceNotSupported;

  /// No description provided for @voiceFoundSchemes.
  ///
  /// In en, this message translates to:
  /// **'Found {count} scheme(s) for {state} · {caste} · {occupation}'**
  String voiceFoundSchemes(
      int count, String state, String caste, String occupation);

  /// No description provided for @seeAllSchemes.
  ///
  /// In en, this message translates to:
  /// **'See all {count} schemes →'**
  String seeAllSchemes(int count);

  /// No description provided for @onboardingStep1Title.
  ///
  /// In en, this message translates to:
  /// **'Where do you live?'**
  String get onboardingStep1Title;

  /// No description provided for @onboardingStep1Sub.
  ///
  /// In en, this message translates to:
  /// **'We use this to find schemes in your state'**
  String get onboardingStep1Sub;

  /// No description provided for @onboardingStep2Title.
  ///
  /// In en, this message translates to:
  /// **'Tell us about yourself'**
  String get onboardingStep2Title;

  /// No description provided for @onboardingStep2Sub.
  ///
  /// In en, this message translates to:
  /// **'This helps us match the right schemes'**
  String get onboardingStep2Sub;

  /// No description provided for @onboardingStep3Title.
  ///
  /// In en, this message translates to:
  /// **'Your income & work'**
  String get onboardingStep3Title;

  /// No description provided for @onboardingStep3Sub.
  ///
  /// In en, this message translates to:
  /// **'Many schemes depend on income and occupation'**
  String get onboardingStep3Sub;

  /// No description provided for @onboardingStep4Title.
  ///
  /// In en, this message translates to:
  /// **'Almost done!'**
  String get onboardingStep4Title;

  /// No description provided for @onboardingStep4Sub.
  ///
  /// In en, this message translates to:
  /// **'Review your profile before we find your schemes'**
  String get onboardingStep4Sub;

  /// No description provided for @selectState.
  ///
  /// In en, this message translates to:
  /// **'Select your state'**
  String get selectState;

  /// No description provided for @chooseState.
  ///
  /// In en, this message translates to:
  /// **'— Choose state —'**
  String get chooseState;

  /// No description provided for @genderLabel.
  ///
  /// In en, this message translates to:
  /// **'Gender'**
  String get genderLabel;

  /// No description provided for @genderMale.
  ///
  /// In en, this message translates to:
  /// **'Male'**
  String get genderMale;

  /// No description provided for @genderFemale.
  ///
  /// In en, this message translates to:
  /// **'Female'**
  String get genderFemale;

  /// No description provided for @genderOther.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get genderOther;

  /// No description provided for @categoryLabel.
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get categoryLabel;

  /// No description provided for @ageLabel.
  ///
  /// In en, this message translates to:
  /// **'Your age'**
  String get ageLabel;

  /// No description provided for @agePlaceholder.
  ///
  /// In en, this message translates to:
  /// **'e.g. 28'**
  String get agePlaceholder;

  /// No description provided for @incomeLabel.
  ///
  /// In en, this message translates to:
  /// **'Annual household income'**
  String get incomeLabel;

  /// No description provided for @occupationLabel.
  ///
  /// In en, this message translates to:
  /// **'Occupation'**
  String get occupationLabel;

  /// No description provided for @btnContinue.
  ///
  /// In en, this message translates to:
  /// **'Continue →'**
  String get btnContinue;

  /// No description provided for @btnFindMySchemes.
  ///
  /// In en, this message translates to:
  /// **'Find My Schemes 🎯'**
  String get btnFindMySchemes;

  /// No description provided for @btnBack.
  ///
  /// In en, this message translates to:
  /// **'← Back'**
  String get btnBack;

  /// No description provided for @stepOf.
  ///
  /// In en, this message translates to:
  /// **'{step} of {total}'**
  String stepOf(int step, int total);

  /// No description provided for @profileSavedLocally.
  ///
  /// In en, this message translates to:
  /// **'✅ Your profile is saved only on your phone. We never upload it.'**
  String get profileSavedLocally;

  /// No description provided for @schemesTitle.
  ///
  /// In en, this message translates to:
  /// **'My Schemes'**
  String get schemesTitle;

  /// No description provided for @schemesSubtitle.
  ///
  /// In en, this message translates to:
  /// **'{count} schemes matched for you'**
  String schemesSubtitle(int count);

  /// No description provided for @filterAll.
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get filterAll;

  /// No description provided for @openNow.
  ///
  /// In en, this message translates to:
  /// **'Open now'**
  String get openNow;

  /// No description provided for @amountVaries.
  ///
  /// In en, this message translates to:
  /// **'Amount varies'**
  String get amountVaries;

  /// No description provided for @noSchemesTitle.
  ///
  /// In en, this message translates to:
  /// **'No schemes found'**
  String get noSchemesTitle;

  /// No description provided for @noSchemesSub.
  ///
  /// In en, this message translates to:
  /// **'Try updating your profile or checking back later.'**
  String get noSchemesSub;

  /// No description provided for @searchTitle.
  ///
  /// In en, this message translates to:
  /// **'AI Semantic Search'**
  String get searchTitle;

  /// No description provided for @searchSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Search by intent or situation instead of exact keywords'**
  String get searchSubtitle;

  /// No description provided for @searchPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'e.g. financial aid for poor SC female student to study…'**
  String get searchPlaceholder;

  /// No description provided for @searchBtn.
  ///
  /// In en, this message translates to:
  /// **'Search Schemes'**
  String get searchBtn;

  /// No description provided for @searchHint.
  ///
  /// In en, this message translates to:
  /// **'Try typing your gender, state, occupation, and what help you need.'**
  String get searchHint;

  /// No description provided for @searching.
  ///
  /// In en, this message translates to:
  /// **'Analysing query & matching schemes…'**
  String get searching;

  /// No description provided for @searchNoResults.
  ///
  /// In en, this message translates to:
  /// **'No schemes matched your search. Try describing your situation differently.'**
  String get searchNoResults;

  /// No description provided for @searchResultsLabel.
  ///
  /// In en, this message translates to:
  /// **'Schemes found by intent match:'**
  String get searchResultsLabel;

  /// No description provided for @matchPercent.
  ///
  /// In en, this message translates to:
  /// **'{pct}% Match'**
  String matchPercent(int pct);

  /// No description provided for @schemeDetailTitle.
  ///
  /// In en, this message translates to:
  /// **'Scheme Details'**
  String get schemeDetailTitle;

  /// No description provided for @benefitLabel.
  ///
  /// In en, this message translates to:
  /// **'Benefit'**
  String get benefitLabel;

  /// No description provided for @ministryLabel.
  ///
  /// In en, this message translates to:
  /// **'Ministry'**
  String get ministryLabel;

  /// No description provided for @eligibilityLabel.
  ///
  /// In en, this message translates to:
  /// **'Eligibility'**
  String get eligibilityLabel;

  /// No description provided for @documentsLabel.
  ///
  /// In en, this message translates to:
  /// **'Documents Required'**
  String get documentsLabel;

  /// No description provided for @applyNow.
  ///
  /// In en, this message translates to:
  /// **'Apply Now →'**
  String get applyNow;

  /// No description provided for @deadlineLabel.
  ///
  /// In en, this message translates to:
  /// **'Deadline'**
  String get deadlineLabel;

  /// No description provided for @rollingLabel.
  ///
  /// In en, this message translates to:
  /// **'Rolling / Always open'**
  String get rollingLabel;

  /// No description provided for @eligibleLabel.
  ///
  /// In en, this message translates to:
  /// **'✅ You appear eligible'**
  String get eligibleLabel;

  /// No description provided for @notEligibleLabel.
  ///
  /// In en, this message translates to:
  /// **'❌ You may not be eligible'**
  String get notEligibleLabel;

  /// No description provided for @profileTitle.
  ///
  /// In en, this message translates to:
  /// **'My Profile'**
  String get profileTitle;

  /// No description provided for @profileState.
  ///
  /// In en, this message translates to:
  /// **'State'**
  String get profileState;

  /// No description provided for @profileGender.
  ///
  /// In en, this message translates to:
  /// **'Gender'**
  String get profileGender;

  /// No description provided for @profileCategory.
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get profileCategory;

  /// No description provided for @profileAge.
  ///
  /// In en, this message translates to:
  /// **'Age'**
  String get profileAge;

  /// No description provided for @profileAgeYears.
  ///
  /// In en, this message translates to:
  /// **'{age} years'**
  String profileAgeYears(int age);

  /// No description provided for @profileIncome.
  ///
  /// In en, this message translates to:
  /// **'Income'**
  String get profileIncome;

  /// No description provided for @profileOccupation.
  ///
  /// In en, this message translates to:
  /// **'Occupation'**
  String get profileOccupation;

  /// No description provided for @btnEditProfile.
  ///
  /// In en, this message translates to:
  /// **'Edit Profile'**
  String get btnEditProfile;

  /// No description provided for @btnSave.
  ///
  /// In en, this message translates to:
  /// **'Save Changes'**
  String get btnSave;

  /// No description provided for @btnDeleteProfile.
  ///
  /// In en, this message translates to:
  /// **'Delete Profile'**
  String get btnDeleteProfile;

  /// No description provided for @deleteConfirmTitle.
  ///
  /// In en, this message translates to:
  /// **'Delete Profile?'**
  String get deleteConfirmTitle;

  /// No description provided for @deleteConfirmMsg.
  ///
  /// In en, this message translates to:
  /// **'You will need to fill it in again to see matched schemes.'**
  String get deleteConfirmMsg;

  /// No description provided for @btnCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get btnCancel;

  /// No description provided for @btnDelete.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get btnDelete;

  /// No description provided for @profileSavedToast.
  ///
  /// In en, this message translates to:
  /// **'Profile saved!'**
  String get profileSavedToast;

  /// No description provided for @chatTitle.
  ///
  /// In en, this message translates to:
  /// **'AI Scheme Assistant'**
  String get chatTitle;

  /// No description provided for @chatSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Ask about welfare eligibility & rules'**
  String get chatSubtitle;

  /// No description provided for @chatPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Type a question…'**
  String get chatPlaceholder;

  /// No description provided for @chatSafety.
  ///
  /// In en, this message translates to:
  /// **'Safe Chat: We never ask for Aadhaar or bank details.'**
  String get chatSafety;

  /// No description provided for @chatRelatedSchemes.
  ///
  /// In en, this message translates to:
  /// **'Related schemes (tap to view details):'**
  String get chatRelatedSchemes;

  /// No description provided for @chatSuggest1.
  ///
  /// In en, this message translates to:
  /// **'Am I eligible for PM-KISAN?'**
  String get chatSuggest1;

  /// No description provided for @chatSuggest2.
  ///
  /// In en, this message translates to:
  /// **'Are there scholarships for students?'**
  String get chatSuggest2;

  /// No description provided for @chatSuggest3.
  ///
  /// In en, this message translates to:
  /// **'Housing support for daily wage workers?'**
  String get chatSuggest3;

  /// No description provided for @chatSuggest4.
  ///
  /// In en, this message translates to:
  /// **'SSY requirements for girls?'**
  String get chatSuggest4;

  /// No description provided for @errorGeneric.
  ///
  /// In en, this message translates to:
  /// **'Something went wrong. Please try again.'**
  String get errorGeneric;

  /// No description provided for @errorNoConnection.
  ///
  /// In en, this message translates to:
  /// **'Could not connect to server. Check your connection.'**
  String get errorNoConnection;

  /// No description provided for @btnRetry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get btnRetry;

  /// No description provided for @navHome.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get navHome;

  /// No description provided for @navSchemes.
  ///
  /// In en, this message translates to:
  /// **'Schemes'**
  String get navSchemes;

  /// No description provided for @navSearch.
  ///
  /// In en, this message translates to:
  /// **'Search'**
  String get navSearch;

  /// No description provided for @navProfile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get navProfile;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'hi', 'ta'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'hi':
      return AppLocalizationsHi();
    case 'ta':
      return AppLocalizationsTa();
  }

  throw FlutterError(
      'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
      'an issue with the localizations generation tool. Please file an issue '
      'on GitHub with a reproducible sample app and the gen-l10n configuration '
      'that was used.');
}
