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
  String? answer;
  String? error;
  bool loading = true;
  bool asking = false;
  String? selectedImageUrl;
  bool _isTyping = false;

  static const _quickChips = ['Malaria', 'UTI', 'Pneumonia', 'Anaemia', 'Hypertension', 'Sepsis'];

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
    if (question.text.trim().isEmpty) return;
    setState(() {
      asking = true;
      error = null;
      answer = null;
      _isTyping = true;
    });
    try {
      final result = await widget.api.ask(question.text.trim(), imageUrl: selectedImageUrl);
      if (mounted) {
        setState(() {
          answer = result['answer']?.toString();
          question.clear();
          selectedImageUrl = null;
          _isTyping = false;
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
          if (widget.showAppBar) ...[
            Container(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              decoration: const BoxDecoration(
                color: AfyaColors.surface,
                border: Border(bottom: BorderSide(color: AfyaColors.outlineVariant)),
              ),
              child: SafeArea(
                bottom: false,
                child: Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: Image.asset('assets/images/afyadrop_logo.png', fit: BoxFit.cover),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('AfyaDrop', style: AfyaTextStyles.labelLarge.copyWith(fontWeight: FontWeight.w700)),
                          Text('Consult', style: AfyaTextStyles.bodySmall.copyWith(
                            color: AfyaColors.onSurface.withOpacity(0.6),
                          )),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AfyaColors.countryColor(countryCode).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(AfyaRadius.full),
                      ),
                      child: Text(
                        countryCode,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AfyaColors.countryColor(countryCode),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    GestureDetector(
                      onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => WalletScreen(api: widget.api))),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AfyaColors.surfaceVariant,
                          borderRadius: BorderRadius.circular(AfyaRadius.full),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.account_balance_wallet_outlined, size: 14, color: AfyaColors.primary),
                            const SizedBox(width: 4),
                            Text('$balance', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AfyaColors.primary)),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => ProfileScreen(api: widget.api))),
                      child: CircleAvatar(
                        radius: 16,
                        backgroundColor: AfyaColors.primary.withOpacity(0.1),
                        child: Text(
                          (profile?['full_name']?.toString() ?? 'U').substring(0, 1).toUpperCase(),
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AfyaColors.primary),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: const BoxDecoration(
                color: AfyaColors.surface,
                border: Border(bottom: BorderSide(color: AfyaColors.outlineVariant)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AfyaColors.secondary,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Active: Uganda Clinical Guidelines (UCG 2023)',
                      style: AfyaTextStyles.bodySmall.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.swap_horiz_rounded, size: 18),
                    onPressed: () {},
                    visualDensity: VisualDensity.compact,
                  ),
                  IconButton(
                    icon: const Icon(Icons.refresh_rounded, size: 18),
                    onPressed: refresh,
                    visualDensity: VisualDensity.compact,
                  ),
                ],
              ),
            ),
          ],
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
                        if (answer != null || _isTyping) ...[
                          if (answer != null)
                            _buildAiResponseCard(answer!),
                          if (_isTyping && answer == null)
                            AfyaCard(
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
                          const SizedBox(height: 12),
                        ],
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Recent questions', style: AfyaTextStyles.titleMedium),
                            TextButton.icon(
                              onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => HistoryScreen(api: widget.api, showAppBar: true))),
                              icon: const Icon(Icons.history_rounded, size: 16),
                              label: const Text('View all'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        if (history.isEmpty)
                          Text('Your answered questions will appear here.', style: AfyaTextStyles.bodyMedium.copyWith(
                            color: AfyaColors.onSurface.withOpacity(0.6),
                          )),
                        ...history.take(5).map((item) => GestureDetector(
                          onTap: () => setState(() => answer = item['answer']?.toString()),
                          child: AfyaCard(
                            margin: const EdgeInsets.only(bottom: 8),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                Row(
                                  children: [
                                    Icon(Icons.chat_bubble_outline_rounded, size: 16, color: AfyaColors.primary),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        item['question']?.toString() ?? '',
                                        style: AfyaTextStyles.labelLarge,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  item['created_at']?.toString() ?? '',
                                  style: AfyaTextStyles.bodySmall.copyWith(
                                    color: AfyaColors.onSurface.withOpacity(0.6),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )),
                        const SizedBox(height: 80),
                      ],
                    ),
                  ),
          ),
          if (widget.showAppBar) ...[
            Container(
              decoration: const BoxDecoration(
                color: AfyaColors.surface,
                border: Border(top: BorderSide(color: AfyaColors.outlineVariant)),
              ),
              padding: EdgeInsets.only(
                left: 16,
                right: 16,
                top: 8,
                bottom: MediaQuery.of(context).padding.bottom + 8,
              ),
              child: Column(
                children: [
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: _quickChips.map((chip) {
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: FilterChip(
                            label: Text(chip, style: const TextStyle(fontSize: 12)),
                            onSelected: (value) { if (value) question.text = chip; },
                            backgroundColor: AfyaColors.surfaceVariant,
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: question,
                          minLines: 1,
                          maxLines: 3,
                          decoration: InputDecoration(
                            hintText: 'Ask a clinical question...',
                            suffixIcon: selectedImageUrl != null
                                ? IconButton(
                                    icon: const Icon(Icons.image_rounded, size: 18, color: AfyaColors.primary),
                                    onPressed: () => setState(() => selectedImageUrl = null),
                                  )
                                : null,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton.filled(
                        onPressed: asking ? null : ask,
                        icon: asking
                            ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : const Icon(Icons.send_rounded, size: 18),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Text('1 credit / query', style: AfyaTextStyles.bodySmall.copyWith(
                        color: AfyaColors.onSurface.withOpacity(0.6),
                      )),
                      const Spacer(),
                      Text('Balance: $balance', style: AfyaTextStyles.bodySmall.copyWith(
                        color: AfyaColors.primary,
                        fontWeight: FontWeight.w600,
                      )),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildAiResponseCard(String answerText) {
    return AfyaCard(
      margin: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AfyaColors.secondary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(AfyaRadius.md),
                ),
                child: const Icon(Icons.auto_awesome_rounded, size: 18, color: AfyaColors.secondary),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text('AfyaDrop AI', style: AfyaTextStyles.labelLarge.copyWith(fontWeight: FontWeight.w600)),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AfyaColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(AfyaRadius.full),
                ),
                child: Text('0.8s', style: AfyaTextStyles.labelSmall),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AfyaColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(AfyaRadius.full),
                ),
                child: Text('1 credit', style: AfyaTextStyles.labelSmall),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFFDCFCE7),
              borderRadius: BorderRadius.circular(AfyaRadius.sm),
            ),
            child: Text('Uncomplicated malaria (P. falciparum)', style: AfyaTextStyles.bodySmall.copyWith(
              color: const Color(0xFF166534),
              fontWeight: FontWeight.w600,
            )),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AfyaColors.primary.withOpacity(0.04),
              borderRadius: BorderRadius.circular(AfyaRadius.md),
              border: Border.all(color: AfyaColors.primary.withOpacity(0.12)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('First-line: Artemether-Lumefantrine (AL)', style: AfyaTextStyles.labelLarge.copyWith(fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text('Dose: 20/120 mg x 6 doses over 3 days', style: AfyaTextStyles.bodyMedium),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF2F2),
              borderRadius: BorderRadius.circular(AfyaRadius.sm),
            ),
            child: Row(
              children: [
                const Icon(Icons.warning_amber_rounded, size: 16, color: AfyaColors.error),
                const SizedBox(width: 8),
                Expanded(
                  child: Text('Danger signs: monitor for cerebral malaria, severe anaemia', style: AfyaTextStyles.bodySmall.copyWith(color: AfyaColors.error)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Text('Source: UCG 2023 Chapter 8', style: AfyaTextStyles.bodySmall.copyWith(
            color: AfyaColors.onSurface.withOpacity(0.6),
          )),
          const SizedBox(height: 10),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.thumb_up_alt_outlined, size: 18),
                onPressed: () {},
                visualDensity: VisualDensity.compact,
              ),
              IconButton(
                icon: const Icon(Icons.thumb_down_alt_outlined, size: 18),
                onPressed: () {},
                visualDensity: VisualDensity.compact,
              ),
              IconButton(
                icon: const Icon(Icons.copy_rounded, size: 18),
                onPressed: () {
                  Clipboard.setData(ClipboardData(text: answerText));
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Copied to clipboard')));
                },
                visualDensity: VisualDensity.compact,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
