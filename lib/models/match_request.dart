// lib/models/match_request.dart
// Mirrors backend/models/scheme.py → MatchRequest
// and backend/models/chat.py → ChatRequest

import 'user_profile.dart';
import 'chat_message.dart';

// ── MatchRequest ──────────────────────────────────────────────
// Request body for POST /schemes/match
class MatchRequest {
  final UserProfile userProfile;
  final String language;

  const MatchRequest({
    required this.userProfile,
    this.language = 'en',
  });

  Map<String, dynamic> toJson() => {
    'user_profile': userProfile.toJson(),
    'language':     language,
  };
}

// ── ChatRequest ───────────────────────────────────────────────
// Request body for POST /chat
class ChatRequest {
  final String message;
  final List<ChatMessage> history;
  final UserProfile? userProfile;
  final String language;

  const ChatRequest({
    required this.message,
    this.history = const [],
    this.userProfile,
    this.language = 'en',
  });

  Map<String, dynamic> toJson() => {
    'message':  message,
    'history':  history.map((m) => m.toJson()).toList(),
    if (userProfile != null) 'user_profile': userProfile!.toJson(),
    'language': language,
  };
}
