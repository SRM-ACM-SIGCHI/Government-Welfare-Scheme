// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Hindi (`hi`).
class AppLocalizationsHi extends AppLocalizations {
  AppLocalizationsHi([String locale = 'hi']) : super(locale);

  @override
  String get appTitle => 'कल्याण योजनाएं';

  @override
  String get tagline => 'अपने लिए योग्य सरकारी योजनाएं खोजें';

  @override
  String get ctaGetStarted => 'शुरू करें — मुफ़्त';

  @override
  String get ctaSeeMySchemes => 'मेरी योजनाएं देखें';

  @override
  String get ctaUpdateProfile => 'प्रोफाइल अपडेट करें';

  @override
  String get onboardingMinutes => '1 मिनट से कम • साइन अप की ज़रूरत नहीं';

  @override
  String get safeTitle => 'सुरक्षित & सत्यापित';

  @override
  String get safeLine1 => 'हम कभी आधार या बैंक विवरण नहीं मांगते';

  @override
  String get safeLine2 => 'सभी लिंक सरकारी वेबसाइटों पर जाते हैं';

  @override
  String get safeLine3 => 'आपका डेटा केवल आपके फ़ोन पर रहता है';

  @override
  String get voiceTitle => 'बोलकर योजनाएं खोजें';

  @override
  String get voiceHint => 'माइक दबाएं और बोलें';

  @override
  String get voiceListening => 'सुन रहा है…';

  @override
  String get voiceFinding => 'योजनाएं खोज रहा है…';

  @override
  String get voiceError => 'स्पष्ट रूप से नहीं सुना। फिर से प्रयास करें।';

  @override
  String get voiceNotSupported => 'इस डिवाइस पर वॉइस इनपुट उपलब्ध नहीं है।';

  @override
  String voiceFoundSchemes(
      int count, String state, String caste, String occupation) {
    return '$state · $caste · $occupation के लिए $count योजनाएं मिलीं';
  }

  @override
  String seeAllSchemes(int count) {
    return 'सभी $count योजनाएं देखें →';
  }

  @override
  String get onboardingStep1Title => 'आप कहाँ रहते हैं?';

  @override
  String get onboardingStep1Sub =>
      'हम इसका उपयोग आपके राज्य की योजनाएं खोजने के लिए करते हैं';

  @override
  String get onboardingStep2Title => 'अपने बारे में बताएं';

  @override
  String get onboardingStep2Sub =>
      'इससे हमें सही योजनाएं मिलाने में मदद मिलती है';

  @override
  String get onboardingStep3Title => 'आपकी आय और काम';

  @override
  String get onboardingStep3Sub => 'कई योजनाएं आय और पेशे पर निर्भर करती हैं';

  @override
  String get onboardingStep4Title => 'लगभग हो गया!';

  @override
  String get onboardingStep4Sub =>
      'योजनाएं खोजने से पहले अपनी प्रोफाइल की समीक्षा करें';

  @override
  String get selectState => 'अपना राज्य चुनें';

  @override
  String get chooseState => '— राज्य चुनें —';

  @override
  String get genderLabel => 'लिंग';

  @override
  String get genderMale => 'पुरुष';

  @override
  String get genderFemale => 'महिला';

  @override
  String get genderOther => 'अन्य';

  @override
  String get categoryLabel => 'श्रेणी';

  @override
  String get ageLabel => 'आपकी आयु';

  @override
  String get agePlaceholder => 'जैसे 28';

  @override
  String get incomeLabel => 'वार्षिक घरेलू आय';

  @override
  String get occupationLabel => 'पेशा';

  @override
  String get btnContinue => 'जारी रखें →';

  @override
  String get btnFindMySchemes => 'मेरी योजनाएं खोजें 🎯';

  @override
  String get btnBack => '← वापस';

  @override
  String stepOf(int step, int total) {
    return '$step / $total';
  }

  @override
  String get profileSavedLocally =>
      '✅ आपकी प्रोफाइल केवल आपके फ़ोन पर सहेजी जाती है।';

  @override
  String get schemesTitle => 'मेरी योजनाएं';

  @override
  String schemesSubtitle(int count) {
    return 'आपके लिए $count योजनाएं मिलीं';
  }

  @override
  String get filterAll => 'सभी';

  @override
  String get openNow => 'अभी खुला है';

  @override
  String get amountVaries => 'राशि अलग-अलग';

  @override
  String get noSchemesTitle => 'कोई योजना नहीं मिली';

  @override
  String get noSchemesSub => 'अपनी प्रोफाइल अपडेट करें या बाद में जांचें।';

  @override
  String get searchTitle => 'AI सिमेंटिक खोज';

  @override
  String get searchSubtitle => 'सटीक कीवर्ड के बजाय अपनी स्थिति बताएं';

  @override
  String get searchPlaceholder =>
      'उदा. गरीब SC महिला छात्र को पढ़ाई के लिए वित्तीय सहायता…';

  @override
  String get searchBtn => 'योजनाएं खोजें';

  @override
  String get searchHint => 'अपना लिंग, राज्य, पेशा और ज़रूरत विस्तार से लिखें।';

  @override
  String get searching => 'क्वेरी का विश्लेषण और योजनाओं का मिलान…';

  @override
  String get searchNoResults =>
      'आपकी खोज से कोई योजना नहीं मिली। अलग तरीके से लिखें।';

  @override
  String get searchResultsLabel => 'आपकी स्थिति से मेल खाने वाली योजनाएं:';

  @override
  String matchPercent(int pct) {
    return '$pct% मिलान';
  }

  @override
  String get schemeDetailTitle => 'योजना विवरण';

  @override
  String get benefitLabel => 'लाभ';

  @override
  String get ministryLabel => 'मंत्रालय';

  @override
  String get eligibilityLabel => 'पात्रता';

  @override
  String get documentsLabel => 'आवश्यक दस्तावेज';

  @override
  String get applyNow => 'अभी आवेदन करें →';

  @override
  String get deadlineLabel => 'अंतिम तिथि';

  @override
  String get rollingLabel => 'हमेशा खुला रहता है';

  @override
  String get eligibleLabel => '✅ आप पात्र लगते हैं';

  @override
  String get notEligibleLabel => '❌ आप पात्र नहीं हो सकते';

  @override
  String get profileTitle => 'मेरी प्रोफाइल';

  @override
  String get profileState => 'राज्य';

  @override
  String get profileGender => 'लिंग';

  @override
  String get profileCategory => 'श्रेणी';

  @override
  String get profileAge => 'आयु';

  @override
  String profileAgeYears(int age) {
    return '$age वर्ष';
  }

  @override
  String get profileIncome => 'आय';

  @override
  String get profileOccupation => 'पेशा';

  @override
  String get btnEditProfile => 'प्रोफाइल संपादित करें';

  @override
  String get btnSave => 'बदलाव सहेजें';

  @override
  String get btnDeleteProfile => 'प्रोफाइल हटाएं';

  @override
  String get deleteConfirmTitle => 'प्रोफाइल हटाएं?';

  @override
  String get deleteConfirmMsg =>
      'मिलान वाली योजनाएं देखने के लिए आपको फिर से भरना होगा।';

  @override
  String get btnCancel => 'रद्द करें';

  @override
  String get btnDelete => 'हटाएं';

  @override
  String get profileSavedToast => 'प्रोफाइल सहेजी गई!';

  @override
  String get chatTitle => 'AI योजना सहायक';

  @override
  String get chatSubtitle => 'पात्रता और नियमों के बारे में पूछें';

  @override
  String get chatPlaceholder => 'सवाल पूछें…';

  @override
  String get chatSafety =>
      'सुरक्षित चैट: हम कभी आधार या बैंक विवरण नहीं मांगते।';

  @override
  String get chatRelatedSchemes =>
      'संबंधित योजनाएं (विवरण देखने के लिए टैप करें):';

  @override
  String get chatSuggest1 => 'क्या मैं PM-KISAN के लिए पात्र हूँ?';

  @override
  String get chatSuggest2 => 'क्या छात्रों के लिए कोई स्कॉलरशिप है?';

  @override
  String get chatSuggest3 => 'मजदूरों के लिए आवास सहायता?';

  @override
  String get chatSuggest4 => 'बालिकाओं के लिए SSY योजना नियम?';

  @override
  String get errorGeneric => 'कुछ गलत हुआ। फिर से प्रयास करें।';

  @override
  String get errorNoConnection => 'सर्वर से कनेक्ट नहीं हो सका।';

  @override
  String get btnRetry => 'पुनः प्रयास करें';

  @override
  String get navHome => 'होम';

  @override
  String get navSchemes => 'योजनाएं';

  @override
  String get navSearch => 'खोज';

  @override
  String get navProfile => 'प्रोफाइल';
}
