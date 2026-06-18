# Flutter Project Structure — Welfare App

welfare_app/
├── pubspec.yaml
├── l10n.yaml
│
├── android/
│   └── app/
│       └── src/
│           └── main/
│               └── AndroidManifest.xml          ← Phase 11
│
└── lib/
    ├── main.dart                                 ← Phase 10
    ├── app.dart                                  ← Phase 10
    │
    ├── constants/
    │   ├── app_constants.dart                    ← Phase 2 (static data)
    │   └── app_theme.dart                        ← Phase 2 (Material 3 theme)
    │
    ├── models/
    │   ├── user_profile.dart                     ← Phase 3
    │   ├── scheme.dart                           ← Phase 3
    │   ├── chat_message.dart                     ← Phase 3
    │   └── match_request.dart                    ← Phase 3
    │
    ├── services/
    │   ├── api_service.dart                      ← Phase 4
    │   └── storage_service.dart                  ← Phase 5
    │
    ├── providers/
    │   ├── language_provider.dart                ← Phase 6
    │   ├── profile_provider.dart                 ← Phase 6
    │   ├── schemes_provider.dart                 ← Phase 6
    │   ├── search_provider.dart                  ← Phase 6
    │   └── chat_provider.dart                    ← Phase 6
    │
    ├── l10n/
    │   ├── app_en.arb                            ← Phase 7
    │   ├── app_ta.arb                            ← Phase 7
    │   └── app_hi.arb                            ← Phase 7
    │
    ├── screens/
    │   ├── home_screen.dart                      ← Phase 8
    │   ├── onboarding_screen.dart                ← Phase 8
    │   ├── schemes_screen.dart                   ← Phase 8
    │   ├── scheme_detail_screen.dart             ← Phase 8
    │   ├── search_screen.dart                    ← Phase 8
    │   └── profile_screen.dart                   ← Phase 8
    │
    └── widgets/
        ├── scheme_card.dart                      ← Phase 8 (shared)
        ├── chatbot_widget.dart                   ← Phase 9
        ├── language_switcher.dart                ← Phase 8 (shared)
        └── skeleton_loader.dart                  ← Phase 8 (shared)
