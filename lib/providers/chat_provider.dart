// lib/providers/chat_provider.dart
// Manages the chatbot conversation.
// Connects to POST /chat — mirrors ChatBot.jsx logic.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/chat_message.dart';
import '../models/match_request.dart';
import 'language_provider.dart';
import 'profile_provider.dart';
import 'schemes_provider.dart';

// ── State ────────────────────────────────────────────────────
class ChatState {
  final List<ChatMessage> messages;
  final bool isLoading;
  final String? error;
  // scheme IDs referenced in the last reply
  final List<String> matchedSchemeIds;

  const ChatState({
    this.messages         = const [],
    this.isLoading        = false,
    this.error,
    this.matchedSchemeIds = const [],
  });

  ChatState copyWith({
    List<ChatMessage>? messages,
    bool? isLoading,
    String? error,
    List<String>? matchedSchemeIds,
  }) {
    return ChatState(
      messages:         messages         ?? this.messages,
      isLoading:        isLoading        ?? this.isLoading,
      error:            error,
      matchedSchemeIds: matchedSchemeIds ?? this.matchedSchemeIds,
    );
  }
}

// ── Greeting strings (mirrors ChatBot.jsx DICT) ───────────────
const Map<String, String> _greetings = {
  'en': 'Hello! I can explain the eligibility rules for all government schemes '
        'in Tamil, Hindi, or English. Ask me anything!',
  'ta': 'வணக்கம்! நீங்கள் தகுதியான அரசு நலத்திட்டங்கள் மற்றும் அதன் '
        'தகுதிகளை தமிழ், இந்தி அல்லது ஆங்கிலத்தில் விளக்க முடியும். '
        'ஏதேனும் கேளுங்கள்!',
  'hi': 'नमस्ते! मैं सभी सरकारी योजनाओं की पात्रता नियमों को हिंदी, '
        'तमिल या अंग्रेजी में समझा सकता हूँ। कुछ भी पूछें!',
};

// ── Notifier ─────────────────────────────────────────────────
class ChatNotifier extends Notifier<ChatState> {
  @override
  ChatState build() {
    final lang = ref.read(languageProvider);
    final greeting = _greetings[lang] ?? _greetings['en']!;
    return ChatState(
      messages: [ChatMessage(role: 'model', content: greeting)],
    );
  }

  /// Sends a user message and appends the assistant's reply.
  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    final userMsg = ChatMessage(role: 'user', content: text);
    state = state.copyWith(
      messages:  [...state.messages, userMsg],
      isLoading: true,
      error:     null,
    );

    final api     = ref.read(apiServiceProvider);
    final lang    = ref.read(languageProvider);
    final profile = ref.read(profileProvider);

    // Build history excluding the greeting message
    final history = state.messages
        .skip(1)
        .where((m) => m != userMsg)
        .toList();

    try {
      final response = await api.chat(
        ChatRequest(
          message:     text,
          history:     history,
          userProfile: profile,
          language:    lang,
        ),
      );

      final botMsg = ChatMessage(role: 'model', content: response.reply);
      state = ChatState(
        messages:         [...state.messages, botMsg],
        matchedSchemeIds: response.matchedSchemes,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  /// Reset the conversation (keeps greeting in new language).
  void reset() {
    final lang = ref.read(languageProvider);
    final greeting = _greetings[lang] ?? _greetings['en']!;
    state = ChatState(
      messages: [ChatMessage(role: 'model', content: greeting)],
    );
  }
}

// ── Provider ─────────────────────────────────────────────────
final chatProvider = NotifierProvider<ChatNotifier, ChatState>(
  ChatNotifier.new,
);
