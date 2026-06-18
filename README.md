# Welfare Schemes — Flutter Android App

Native Android client for the India Government Welfare Schemes platform.
Connects to the existing FastAPI backend and mirrors all functionality from the Next.js web app.

---

## Architecture overview

```
┌──────────────────────────────────────────────────────────┐
│  Flutter (Android)                                        │
│                                                          │
│  Screens  →  Riverpod Providers  →  ApiService (Dio)     │
│                      ↕                                   │
│           StorageService (SharedPreferences)             │
└──────────────────────────────────────────────────────────┘
                          ↕  HTTP
┌──────────────────────────────────────────────────────────┐
│  FastAPI backend  (Python)                                │
│  POST /schemes/match    GET /schemes/search              │
│  GET  /schemes/semantic-search                           │
│  GET  /schemes/{id}     POST /schemes/check/{id}         │
│  POST /chat             GET /health                      │
└──────────────────────────────────────────────────────────┘
                          ↕
            PostgreSQL / Supabase + pgvector
```

---

## Prerequisites

| Tool | Minimum version |
|---|---|
| Flutter SDK | 3.22.x (Stable channel) |
| Dart SDK | 3.4.x (bundled with Flutter) |
| Android Studio / SDK | API 21+ target |
| Java | 17 |
| Python (backend) | 3.11+ |

---

## 1 — Backend setup

The Flutter app is a client; it requires the FastAPI backend to be running.

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### CORS — critical

Open `backend/main.py` (or wherever `CORSMiddleware` is configured) and make sure
the following origins are allowed:

```python
origins = [
    "http://localhost:3000",          # Next.js dev
    "http://10.0.2.2:8000",           # Android emulator → host loopback
    "http://192.168.x.x:8000",        # LAN IP for real device (replace x.x)
]
```

---

## 2 — Flutter setup

```bash
cd welfare_app

# Install dependencies
flutter pub get

# Generate localisation files (creates .dart_tool/flutter_gen/…)
flutter gen-l10n
```

### Base URL configuration

The default base URL points to the Android emulator's host machine:

```
lib/constants/app_constants.dart  →  static const String baseUrl = 'http://10.0.2.2:8000';
```

| Scenario | URL to use |
|---|---|
| Android emulator on same machine | `http://10.0.2.2:8000` (default) |
| Real Android device on same Wi-Fi | `http://192.168.x.x:8000` (your machine's LAN IP) |
| Production | `https://your-backend.example.com` |

---

## 3 — Run on emulator

```bash
# List available devices
flutter devices

# Run on connected device/emulator
flutter run

# Run with a specific device id
flutter run -d emulator-5554
```

---

## 4 — Build release APK

```bash
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

To build an App Bundle for the Play Store:

```bash
flutter build appbundle --release
```

---

## 5 — Localization

The app supports **English**, **Tamil**, and **Hindi**.

ARB source files live in `lib/l10n/`:

| File | Locale |
|---|---|
| `app_en.arb` | English (template) |
| `app_ta.arb` | Tamil |
| `app_hi.arb` | Hindi |

After editing any `.arb` file, regenerate:

```bash
flutter gen-l10n
```

The generated `AppLocalizations` class is referenced in `lib/app.dart`.
Language is persisted in `SharedPreferences` via `StorageService` and
drives both the UI locale (`MaterialApp.locale`) and the `language`
parameter sent to every API call.

---

## 6 — Project structure

```
lib/
├── main.dart                 Entry point
├── app.dart                  MaterialApp.router + GoRouter
├── constants/
│   ├── app_constants.dart    Static data (states, castes, occupations…)
│   └── app_theme.dart        Material 3 theme
├── models/
│   ├── user_profile.dart
│   ├── scheme.dart           MatchedScheme + Scheme + EligibilityCheckResult
│   ├── chat_message.dart     ChatMessage + ChatResponse
│   └── match_request.dart    MatchRequest + ChatRequest
├── services/
│   ├── api_service.dart      Dio HTTP client → all FastAPI endpoints
│   └── storage_service.dart  SharedPreferences wrapper
├── providers/
│   ├── language_provider.dart
│   ├── profile_provider.dart
│   ├── schemes_provider.dart
│   ├── search_provider.dart
│   └── chat_provider.dart
├── l10n/
│   ├── app_en.arb
│   ├── app_ta.arb
│   └── app_hi.arb
├── screens/
│   ├── home_screen.dart
│   ├── onboarding_screen.dart
│   ├── schemes_screen.dart
│   ├── scheme_detail_screen.dart
│   ├── search_screen.dart
│   └── profile_screen.dart
└── widgets/
    ├── scheme_card.dart
    ├── chatbot_widget.dart
    ├── language_switcher.dart
    └── skeleton_loader.dart
```

---

## 7 — API → screen mapping

| Screen | Endpoint(s) |
|---|---|
| HomeScreen (voice) | `POST /schemes/match` |
| OnboardingScreen | *(local storage only)* |
| SchemesScreen | `POST /schemes/match`, `GET /schemes/semantic-search` |
| SchemeDetailScreen | `GET /schemes/{id}`, `POST /schemes/check/{id}` |
| SearchScreen | `GET /schemes/semantic-search`, `GET /schemes/search` |
| ProfileScreen | *(local storage only)* |
| ChatbotWidget | `POST /chat` |

---

## 8 — Permissions (AndroidManifest.xml)

| Permission | Reason |
|---|---|
| `INTERNET` | All API calls to the FastAPI backend |
| `RECORD_AUDIO` | Voice search on HomeScreen (`speech_to_text`) |

`android:usesCleartextTraffic="true"` is set to allow plain HTTP to the
local dev server. Remove it when deploying against an HTTPS backend.

---

## 9 — Troubleshooting

**"Could not connect to server"**
- Make sure the FastAPI backend is running on port 8000
- For a real device, update `baseUrl` to your machine's LAN IP
- Check that CORS allows `http://10.0.2.2:8000`

**Voice search not working**
- Grant microphone permission on the device (Settings → Apps → Welfare Schemes → Permissions)
- The emulator's microphone input must be enabled in AVD settings

**`flutter gen-l10n` fails**
- Confirm `l10n.yaml` is at the project root (same level as `pubspec.yaml`)
- Run `flutter pub get` first

**Blank schemes list**
- Ensure the backend's `/schemes/match` returns data for the saved profile
- Check the backend logs for 422 validation errors (field name mismatch)

---

## 10 — Key dependencies

| Package | Version | Purpose |
|---|---|---|
| `dio` | ^5.4.3+1 | HTTP client |
| `flutter_riverpod` | ^2.5.1 | State management |
| `go_router` | ^13.2.1 | Declarative navigation |
| `shared_preferences` | ^2.2.3 | Local profile + language storage |
| `speech_to_text` | ^6.6.2 | Voice search |
| `url_launcher` | ^6.2.6 | Open government apply links |
| `shimmer` | ^3.0.0 | Loading skeleton cards |
| `flutter_localizations` | SDK | i18n delegates |
| `intl` | ^0.19.0 | Locale formatting |
