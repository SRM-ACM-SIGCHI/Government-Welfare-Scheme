// lib/widgets/chatbot_widget.dart
// Floating Action Button that opens a bottom-sheet chat.
// Connects to POST /chat — mirrors frontend/components/ChatBot.jsx.
// Supports all three languages; passes user profile from local storage.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../constants/app_theme.dart';
import '../models/chat_message.dart';
import '../providers/chat_provider.dart';
import '../providers/language_provider.dart';

// ── Localised strings ─────────────────────────────────────────
const _dict = {
  'en': {
    'title':      'AI Scheme Assistant',
    'subtitle':   'Ask about welfare eligibility & rules',
    'placeholder':'Type a question…',
    'safety':     'Safe Chat: We never ask for Aadhaar or bank details.',
    'referenced': 'Related schemes (tap to view details):',
    's1': 'Am I eligible for PM-KISAN?',
    's2': 'Are there scholarships for students?',
    's3': 'Housing support for daily wage workers?',
    's4': 'SSY requirements for girls?',
  },
  'ta': {
    'title':      'AI திட்ட உதவியாளர்',
    'subtitle':   'தகுதி & விதிகள் பற்றி கேளுங்கள்',
    'placeholder':'கேள்வி கேளுங்கள்…',
    'safety':     'பாதுகாப்பான அரட்டை: ஆதார் அல்லது வங்கி எண்களை கேட்கமாட்டோம்.',
    'referenced': 'தொடர்புடைய திட்டங்கள் (விவரம் பார்க்க தட்டவும்):',
    's1': 'PM-KISAN தகுதி எனக்கு உண்டா?',
    's2': 'மாணவர்களுக்கான கல்வி உதவித்தொகை உள்ளதா?',
    's3': 'கூலித் தொழிலாளர்களுக்கு வீட்டு வசதி உள்ளதா?',
    's4': 'பெண் குழந்தைகளுக்கான SSY திட்டம்?',
  },
  'hi': {
    'title':      'AI योजना सहायक',
    'subtitle':   'पात्रता और नियमों के बारे में पूछें',
    'placeholder':'सवाल पूछें…',
    'safety':     'सुरक्षित चैट: हम कभी आधार या बैंक विवरण नहीं मांगते।',
    'referenced': 'संबंधित योजनाएं (विवरण देखने के लिए टैप करें):',
    's1': 'क्या मैं PM-KISAN के लिए पात्र हूँ?',
    's2': 'क्या छात्रों के लिए कोई स्कॉलरशिप है?',
    's3': 'मजदूरों के लिए आवास सहायता?',
    's4': 'बालिकाओं के लिए SSY योजना नियम?',
  },
};

// ── FAB entry point ───────────────────────────────────────────
class ChatbotWidget extends ConsumerWidget {
  const ChatbotWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return FloatingActionButton(
      onPressed: () => _openChat(context),
      backgroundColor: AppTheme.secondary,
      child: const Text('💬', style: TextStyle(fontSize: 22)),
    );
  }

  void _openChat(BuildContext context) {
    showModalBottomSheet(
      context:       context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder:       (_) => const _ChatSheet(),
    );
  }
}

// ── Chat bottom sheet ─────────────────────────────────────────
class _ChatSheet extends ConsumerStatefulWidget {
  const _ChatSheet();

  @override
  ConsumerState<_ChatSheet> createState() => _ChatSheetState();
}

class _ChatSheetState extends ConsumerState<_ChatSheet> {
  final _textController  = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _send([String? presetText]) {
    final text = presetText ?? _textController.text.trim();
    if (text.isEmpty) return;
    _textController.clear();
    ref.read(chatProvider.notifier).sendMessage(text);
    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve:    Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final lang  = ref.watch(languageProvider);
    final state = ref.watch(chatProvider);
    final t     = _dict[lang] ?? _dict['en']!;

    // Autoscroll on new messages
    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

    final suggestions = [t['s1']!, t['s2']!, t['s3']!, t['s4']!];

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize:     0.4,
      maxChildSize:     0.95,
      builder: (_, scrollCtrl) => Container(
        decoration: const BoxDecoration(
          color:        Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            // ── Handle ──────────────────────────────────
            Container(
              width:  40,
              height: 4,
              margin: const EdgeInsets.only(top: 12, bottom: 4),
              decoration: BoxDecoration(
                color:        const Color(0xFFE5E7EB),
                borderRadius: BorderRadius.circular(2),
              ),
            ),

            // ── Header ──────────────────────────────────
            Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(t['title']!,
                            style: const TextStyle(
                              fontSize:   16,
                              fontWeight: FontWeight.w700,
                            )),
                        Text(t['subtitle']!,
                            style: const TextStyle(
                              fontSize: 12,
                              color:    AppTheme.textMuted,
                            )),
                      ],
                    ),
                  ),
                  IconButton(
                    icon:      const Icon(Icons.close),
                    onPressed: Navigator.of(context).pop,
                  ),
                ],
              ),
            ),

            // ── Safety notice ───────────────────────────
            Container(
              margin:  const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color:        const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '🔒 ${t["safety"]!}',
                style: const TextStyle(
                    fontSize: 12, color: Color(0xFF166534)),
              ),
            ),

            const SizedBox(height: 8),
            const Divider(height: 1),

            // ── Messages ────────────────────────────────
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding:    const EdgeInsets.all(16),
                itemCount:  state.messages.length + (state.isLoading ? 1 : 0),
                itemBuilder: (_, i) {
                  if (i == state.messages.length) {
                    return const _TypingIndicator();
                  }
                  final msg = state.messages[i];
                  return _MessageBubble(msg: msg);
                },
              ),
            ),

            // ── Matched scheme pills ─────────────────────
            if (state.matchedSchemeIds.isNotEmpty)
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(t['referenced']!,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color:    AppTheme.textMuted,
                        )),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: state.matchedSchemeIds.map((id) {
                        return GestureDetector(
                          onTap: () {
                            Navigator.pop(context);
                            GoRouter.of(context).go('/schemes/$id');
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color:        const Color(0xFFEFF6FF),
                              border:       Border.all(
                                  color: const Color(0xFFBFDBFE)),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              id,
                              style: const TextStyle(
                                  fontSize: 12, color: AppTheme.primary),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),

            // ── Suggestion chips (shown when only greeting exists) ─
            if (state.messages.length == 1)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
                child: Wrap(
                  spacing:    6,
                  runSpacing: 6,
                  children:   suggestions
                      .map((s) => _SuggestionChip(
                            label: s,
                            onTap: () => _send(s),
                          ))
                      .toList(),
                ),
              ),

            // ── Input row ───────────────────────────────
            const Divider(height: 1),
            Padding(
              padding: EdgeInsets.only(
                left:   12,
                right:  12,
                top:    8,
                bottom: MediaQuery.of(context).viewInsets.bottom + 12,
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller:  _textController,
                      decoration: InputDecoration(
                        hintText:      t['placeholder'],
                        border:        OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide:
                              const BorderSide(color: AppTheme.border),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide:
                              const BorderSide(color: AppTheme.border),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 10),
                      ),
                      onSubmitted: (_) => _send(),
                      textInputAction: TextInputAction.send,
                    ),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: _send,
                    child: Container(
                      width:  44,
                      height: 44,
                      decoration: BoxDecoration(
                        color:  AppTheme.primary,
                        shape:  BoxShape.circle,
                      ),
                      child: const Icon(
                          Icons.send, color: Colors.white, size: 18),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Message bubble ────────────────────────────────────────────
class _MessageBubble extends StatelessWidget {
  final ChatMessage msg;
  const _MessageBubble({required this.msg});

  @override
  Widget build(BuildContext context) {
    final isUser = msg.isUser;
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin:  const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.8,
        ),
        decoration: BoxDecoration(
          color: isUser
              ? AppTheme.primary
              : const Color(0xFFF3F4F6),
          borderRadius: BorderRadius.only(
            topLeft:     const Radius.circular(16),
            topRight:    const Radius.circular(16),
            bottomLeft:  Radius.circular(isUser ? 16 : 4),
            bottomRight: Radius.circular(isUser ? 4 : 16),
          ),
        ),
        child: Text(
          msg.content,
          style: TextStyle(
            fontSize: 14,
            color:    isUser ? Colors.white : AppTheme.onBackground,
            height:   1.5,
          ),
        ),
      ),
    );
  }
}

// ── Typing indicator ──────────────────────────────────────────
class _TypingIndicator extends StatefulWidget {
  const _TypingIndicator();

  @override
  State<_TypingIndicator> createState() => _TypingIndicatorState();
}

class _TypingIndicatorState extends State<_TypingIndicator>
    with SingleTickerProviderStateMixin {
  late final AnimationController _anim;

  @override
  void initState() {
    super.initState();
    _anim = AnimationController(
      vsync:    this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _anim.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin:  const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color:        const Color(0xFFF3F4F6),
          borderRadius: BorderRadius.circular(16),
        ),
        child: FadeTransition(
          opacity: _anim,
          child: const Text('…',
              style: TextStyle(
                  fontSize: 20, color: AppTheme.textMuted)),
        ),
      ),
    );
  }
}

// ── Suggestion chip ───────────────────────────────────────────
class _SuggestionChip extends StatelessWidget {
  final String       label;
  final VoidCallback onTap;

  const _SuggestionChip({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color:        Colors.white,
          border:       Border.all(color: AppTheme.border),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: const TextStyle(
              fontSize: 12, color: AppTheme.onBackground),
        ),
      ),
    );
  }
}
