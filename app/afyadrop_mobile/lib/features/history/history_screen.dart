import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/api.dart';
import '../../core/design_system.dart';
import '../../core/widgets/afya_badge.dart';
import '../../core/widgets/afya_card.dart';
import '../../core/widgets/afya_chip.dart';
import '../../core/widgets/afya_disclaimer.dart';
import '../profile/profile_screen.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key, required this.api, this.showAppBar = false});
  final AfyaDropApi api;
  final bool showAppBar;

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  List<Map<String, dynamic>> items = [];
  bool loading = true;
  String? selectedFilter;
  String? selectedItem;

  static const _filters = [
    {'key': 'all', 'label': 'All Consults'},
    {'key': 'lab', 'label': 'With Lab Photos'},
    {'key': 'dosing', 'label': 'Dosing Inquiries'},
    {'key': 'flagged', 'label': 'Flagged for Review'},
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final result = await widget.api.history();
      if (mounted) setState(() => items = result);
    } catch (e) {
      if (mounted) setState(() => items = []);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  List<Map<String, dynamic>> get filteredItems {
    if (selectedFilter == null || selectedFilter == 'all') return items;
    if (selectedFilter == 'lab') return items.where((item) => item['has_image'] == true).toList();
    if (selectedFilter == 'dosing') return items.where((item) => (item['question']?.toString() ?? '').toLowerCase().contains('dose')).toList();
    if (selectedFilter == 'flagged') return items.where((item) => item['flagged'] == true).toList();
    return items;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AfyaColors.background,
      appBar: widget.showAppBar ? AppBar(
        title: const Text('History'),
        actions: [
              IconButton(icon: const Icon(Icons.person_outline_rounded), onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => ProfileScreen(api: widget.api)))),
        ],
      ) : null,
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Consult Archives',
                        style: widget.showAppBar ? null : AfyaTextStyles.headlineSmall,
                      ),
                    ),
                    if (!widget.showAppBar) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AfyaColors.secondary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(AfyaRadius.full),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.lock_rounded, size: 12, color: AfyaColors.secondary),
                            const SizedBox(width: 4),
                            Text('E2EE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AfyaColors.secondary)),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 12),
                TextField(
                  decoration: InputDecoration(
                    hintText: 'Search consultations...',
                    prefixIcon: const Icon(Icons.search_rounded, size: 20),
                    suffixIcon: IconButton(
                      icon: const Icon(Icons.filter_list_rounded, size: 20),
                      onPressed: () {},
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: _filters.map((filter) {
                      final isSelected = selectedFilter == filter['key'];
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: AfyaChip(
                          label: filter['label'] as String,
                          selected: isSelected,
                          onSelected: (value) => setState(() => selectedFilter = value ? filter['key'] as String : null),
                        ),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 12),
                AfyaDisclaimer(
                  title: 'Clinical Decision Support Disclaimer',
                  message: 'Previous consultations are for reference only. Always verify with current clinical guidelines.',
                ),
              ],
            ),
          ),
          Expanded(
            child: loading
                ? const Center(child: CircularProgressIndicator())
                : filteredItems.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.inbox_rounded, size: 48, color: AfyaColors.onSurface.withOpacity(0.3)),
                            const SizedBox(height: 12),
                            Text('No consultations found', style: AfyaTextStyles.bodyMedium.copyWith(
                              color: AfyaColors.onSurface.withOpacity(0.6),
                            )),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: filteredItems.length,
                        itemBuilder: (context, index) {
                          final item = filteredItems[index];
                          return GestureDetector(
                            onTap: () => setState(() => selectedItem = item['id']?.toString()),
                            child: AfyaCard(
                              margin: const EdgeInsets.only(bottom: 8),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(item['question']?.toString() ?? '', style: AfyaTextStyles.labelLarge),
                                      ),
                                      if (item['has_image'] == true)
                                        const Icon(Icons.image_rounded, size: 16, color: AfyaColors.primary),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      Text(item['created_at']?.toString() ?? '', style: AfyaTextStyles.bodySmall),
                                      const Spacer(),
                                      if (item['flagged'] == true)
                                        const AfyaBadge(label: 'Flagged', backgroundColor: Color(0xFFFEF2F2), foregroundColor: AfyaColors.error),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: EdgeInsets.only(
          left: 16,
          right: 16,
          bottom: MediaQuery.of(context).padding.bottom + 8,
        ),
        decoration: const BoxDecoration(
          color: AfyaColors.surface,
          border: Border(top: BorderSide(color: AfyaColors.outlineVariant)),
        ),
        child: Text(
          'Your data is encrypted end-to-end. Consultations are stored securely.',
          textAlign: TextAlign.center,
          style: AfyaTextStyles.bodySmall.copyWith(
            color: AfyaColors.onSurface.withOpacity(0.6),
          ),
        ),
      ),
    );
  }
}
