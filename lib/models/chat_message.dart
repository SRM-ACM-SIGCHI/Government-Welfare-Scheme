// lib/models/chat_message.dart
// Mirrors backend/models/chat.py → ChatMessage

class ChatMessage {
  final String role;    // 'user' | 'model'
  final String content;

  const ChatMessage({
    required this.role,
    required this.content,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      role:    json['role']    as String,
      content: json['content'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
    'role':    role,
    'content': content,
  };

  bool get isUser      => role == 'user';
  bool get isAssistant => role == 'model';

  @override
  String toString() => 'ChatMessage(role: $role, content: ${content.length > 40 ? "${content.substring(0, 40)}…" : content})';
}

// ── ChatResponse ──────────────────────────────────────────────
// Returned by POST /chat
class ChatResponse {
  final String reply;
  final List<String> matchedSchemes; // list of scheme_id strings

  const ChatResponse({
    required this.reply,
    this.matchedSchemes = const [],
  });

  factory ChatResponse.fromJson(Map<String, dynamic> json) {
    return ChatResponse(
      reply: json['reply'] as String,
      matchedSchemes: (json['matched_schemes'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
    );
  }
}
