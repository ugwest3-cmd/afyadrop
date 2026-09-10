import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/api.dart';
import '../../core/design_system.dart';
import '../../core/widgets/afya_badge.dart';
import '../../core/widgets/afya_card.dart';
import '../../core/widgets/afya_disclaimer.dart';
import '../../core/widgets/afya_input.dart';
import '../history/history_screen.dart';
import '../wallet/wallet_screen.dart';
import '../profile/profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.api, this.showAppBar = true});
  final AfyaDropApi api;
  final bool showAppBar;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final question = TextEditingController();
  Map<String, dynamic>? profile;
  List<Map<String, dynamic>> history = [];
  String? _pendingQuestion;
  String? error;
  bool loading = true;
  bool asking = false;
  String? selectedImageUrl;
  bool _isTyping = false;

  static const _quickChips = ['Pneumonia', 'Anaemia', 'Hypertension', 'Sepsis', 'Pediatrics', 'Antibiotic Guidelines'];

  @override
  void initState() {
    super.initState();
    refresh();
  }

  Future<void> refresh() async {
    try {
      final profileResult = await widget.api.me();
      final historyResult = await widget.api.history();
      if (mounted) {
        setState(() {
          profile = Map<String, dynamic>.from(profileResult['user'] ?? {});
          history = historyResult;
          loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          loading = false;
          error = e.toString();
        });
      }
    }
  }

  Future<void> ask() async {
    final text = question.text.trim();
    if (text.isEmpty) return;
    setState(() {
      asking = true;
      error = null;
      _pendingQuestion = text;
      _isTyping = true;
      question.clear();
    });
    try {
      await widget.api.ask(text, imageUrl: selectedImageUrl);
      if (mounted) {
        setState(() {
          selectedImageUrl = null;
          _isTyping = false;
          _pendingQuestion = null;
        });
        await refresh();
      }
    } catch (e) {
      final message = await widget.api.errorMessage(e) ?? e.toString();
      if (mounted) setState(() {
        error = message;
        _isTyping = false;
      });
    } finally {
      if (mounted) setState(() => asking = false);
    }
  }

  Future<void> pickImage() async {
    try {
      final picker = ImagePicker();
      final file = await picker.pickImage(source: ImageSource.gallery, maxWidth: 1024, maxHeight: 1024, imageQuality: 85);
      if (file == null) return;

      final bytes = await file.readAsBytes();
      final fileName = 'lab-reports/${DateTime.now().millisecondsSinceEpoch}-${file.name}';
      await Supabase.instance.client.storage.from('lab-reports').uploadBinary(fileName, bytes, fileOptions: const FileOptions(upsert: true));
      final publicUrl = Supabase.instance.client.storage.from('lab-reports').getPublicUrl(fileName);
      if (mounted) {
        setState(() => selectedImageUrl = publicUrl);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to upload image: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final balance = profile?['balance_credits'] ?? 0;
    final countryCode = profile?['country']?.toString() ?? 'UG';

    return Scaffold(
      backgroundColor: AfyaColors.background,
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: AfyaColors.surfaceVariant.withOpacity(0.5),
              border: const Border(bottom: BorderSide(color: AfyaColors.outlineVariant)),
            ),
            child: Row(
              children: [
                const Icon(Icons.verified_user_outlined, size: 16, color: AfyaColors.secondary),
                const SizedBox(width: 8),
                Expanded(
                  child: RichText(
                    text: TextSpan(
                      text: 'Grounding: ',
                      style: AfyaTextStyles.labelMedium.copyWith(color: AfyaColors.secondary, fontWeight: FontWeight.w700),
                      children: [
                        TextSpan(
                          text: 'Uganda Clinical Guidelines (UCG 2023)',
                          style: AfyaTextStyles.bodySmall.copyWith(color: AfyaColors.onSurface.withOpacity(0.8)),
                        ),
                      ],
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFFDCFCE7),
                    borderRadius: BorderRadius.circular(AfyaRadius.xs),
                  ),
                  child: Text('Live Sync', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AfyaColors.secondary)),
                ),
              ],
            ),
          ),
          Expanded(
            child: loading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: refresh,
                    child: ListView(
                      padding: const EdgeInsets.all(16),
                      children: [
                        if (selectedImageUrl != null)
                          AfyaCard(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: Row(
                              children: [
                                Container(
                                  width: 48,
                                  height: 48,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(AfyaRadius.sm),
                                    border: Border.all(color: AfyaColors.outline),
                                  ),
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(AfyaRadius.sm),
                                    child: Image.network(selectedImageUrl!, fit: BoxFit.cover, width: 48, height: 48),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('Lab report attached', style: AfyaTextStyles.labelLarge),
                                      Text('Ready for analysis', style: AfyaTextStyles.bodySmall),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.close_rounded, size: 18),
                                  onPressed: () => setState(() => selectedImageUrl = null),
                                ),
                              ],
                            ),
                          ),
                        if (_pendingQuestion != null || _isTyping) ...[
                          if (_pendingQuestion != null)
                            _buildUserMessageCard(_pendingQuestion!, 'Just now'),
                          if (_isTyping)
                            AfyaCard(
                              margin: const EdgeInsets.only(bottom: 12),
                              child: Row(
                                children: [
                                  SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: AfyaColors.primary),
                                  ),
                                  const SizedBox(width: 12),
                                  Text('Generating response...', style: AfyaTextStyles.bodyMedium),
                                ],
                              ),
                            ),
                        ],
                        if (history.isEmpty && _pendingQuestion == null && !_isTyping)
                          Center(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 80),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(16),
                                    decoration: BoxDecoration(
                                      color: AfyaColors.primary.withValues(alpha: 0.1),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(Icons.medical_services_outlined, size: 48, color: AfyaColors.primary),
                                  ),
                                  const SizedBox(height: 24),
                                  const Text('How can I help you today?', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.black87)),
                                  const SizedBox(height: 8),
                                  Text('Ask a clinical question to start.', style: TextStyle(fontSize: 15, color: Colors.grey[500], fontWeight: FontWeight.w500)),
                                ],
                              ),
                            ),
                          ),
                        ...history.reversed.map((item) => Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            _buildUserMessageCard(item['question']?.toString() ?? '', item['created_at']?.toString() ?? ''),
                            if (item['answer'] != null && item['answer'].toString().isNotEmpty)
                               _buildAiResponseCard(item['answer'].toString()),
                          ],
                        )),
                        const SizedBox(height: 80),
                      ],
                    ),
                  ),
          ),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 15,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            padding: EdgeInsets.only(
              left: 16,
              right: 16,
              top: 12,
              bottom: MediaQuery.of(context).padding.bottom + 12,
            ),
            child: Column(
              children: [
                if (_quickChips.isNotEmpty && history.isEmpty && _pendingQuestion == null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: _quickChips.map((chip) {
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: ActionChip(
                              label: Text(chip, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                              onPressed: () {
                                question.text = chip;
                              },
                              backgroundColor: AfyaColors.surfaceVariant.withValues(alpha: 0.5),
                              side: BorderSide.none,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    IconButton(
                      onPressed: pickImage,
                      icon: Icon(
                        selectedImageUrl != null ? Icons.image_rounded : Icons.attach_file_rounded,
                        color: selectedImageUrl != null ? AfyaColors.primary : Colors.grey[600],
                        size: 24,
                      ),
                      tooltip: 'Attach lab report or image',
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(28),
                          border: Border.all(color: Colors.grey.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Expanded(
                              child: TextField(
                                controller: question,
                                minLines: 1,
                                maxLines: 4,
                                textInputAction: TextInputAction.send,
                                onSubmitted: (_) => asking ? null : ask(),
                                decoration: InputDecoration(
                                  filled: false,
                                  fillColor: Colors.transparent,
                                  hoverColor: Colors.transparent,
                                  hintText: 'Ask a clinical question...',
                                  hintStyle: TextStyle(color: Colors.grey[500], fontSize: 15),
                                  border: InputBorder.none,
                                  focusedBorder: InputBorder.none,
                                  enabledBorder: InputBorder.none,
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                ),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.only(bottom: 4, right: 4),
                              child: IconButton(
                                onPressed: asking ? null : ask,
                                style: IconButton.styleFrom(
                                  backgroundColor: AfyaColors.primary,
                                  foregroundColor: Colors.white,
                                  shape: const CircleBorder(),
                                  padding: const EdgeInsets.all(8),
                                ),
                                icon: asking
                                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                    : const Icon(Icons.arrow_upward_rounded, size: 20),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                if (selectedImageUrl != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle_rounded, size: 14, color: Colors.green),
                        const SizedBox(width: 6),
                        Text('Image attached', style: TextStyle(fontSize: 12, color: Colors.grey[600], fontWeight: FontWeight.w500)),
                        const Spacer(),
                        InkWell(
                          onTap: () => setState(() => selectedImageUrl = null),
                          child: const Text('Remove', style: TextStyle(fontSize: 12, color: Colors.red, fontWeight: FontWeight.w600)),
                        ),
                      ],
                    ),
                  ),
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.generating_tokens_outlined, size: 12, color: Colors.grey[500]),
                      const SizedBox(width: 4),
                      Text('1 credit / query', style: TextStyle(fontSize: 11, color: Colors.grey[500], fontWeight: FontWeight.w500)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUserMessageCard(String text, String time) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0, left: 32.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              color: Color(0xFFF3F4F6),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(20),
                bottomLeft: Radius.circular(20),
                bottomRight: Radius.circular(20),
                topRight: Radius.circular(4),
              ),
            ),
            child: Text(text, style: const TextStyle(fontSize: 15, color: Colors.black87, height: 1.4, fontWeight: FontWeight.w500)),
          ),
          Padding(
            padding: const EdgeInsets.only(top: 4.0, right: 4.0),
            child: Text(time, style: TextStyle(fontSize: 11, color: Colors.grey[500])),
          ),
        ],
      ),
    );
  }

  Widget _buildAiResponseCard(String answerText) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24.0, right: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: const BoxDecoration(
                  color: AfyaColors.primary,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.auto_awesome_rounded, size: 14, color: Colors.white),
              ),
              const SizedBox(width: 8),
              const Text('AfyaDrop AI', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.black87)),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: const BorderRadius.only(
                topRight: Radius.circular(20),
                bottomLeft: Radius.circular(20),
                bottomRight: Radius.circular(20),
                topLeft: Radius.circular(4),
              ),
              border: Border.all(color: Colors.grey.withValues(alpha: 0.15)),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                MarkdownBody(
                  data: answerText,
                  styleSheet: MarkdownStyleSheet(
                    p: const TextStyle(fontSize: 15, color: Colors.black87, height: 1.6),
                    h1: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, height: 1.4),
                    h2: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, height: 1.4),
                    h3: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, height: 1.4),
                    listBullet: const TextStyle(color: AfyaColors.primary),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.thumb_up_alt_outlined, size: 16, color: Colors.grey),
                      onPressed: () {},
                      visualDensity: VisualDensity.compact,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                    const SizedBox(width: 12),
                    IconButton(
                      icon: const Icon(Icons.thumb_down_alt_outlined, size: 16, color: Colors.grey),
                      onPressed: () {},
                      visualDensity: VisualDensity.compact,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                    const SizedBox(width: 12),
                    IconButton(
                      icon: const Icon(Icons.copy_rounded, size: 16, color: Colors.grey),
                      onPressed: () {
                        Clipboard.setData(ClipboardData(text: answerText));
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Copied to clipboard')));
                      },
                      visualDensity: VisualDensity.compact,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
