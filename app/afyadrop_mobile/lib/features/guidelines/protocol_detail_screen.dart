import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../../../core/design_system.dart';
import '../../../core/widgets/afya_card.dart';
import '../../../core/widgets/afya_disclaimer.dart';

class ProtocolDetailScreen extends StatefulWidget {
  const ProtocolDetailScreen({super.key});

  @override
  State<ProtocolDetailScreen> createState() => _ProtocolDetailScreenState();
}

class _ProtocolDetailScreenState extends State<ProtocolDetailScreen> {
  final _tocController = TextEditingController();
  bool _bookmarked = false;

  static const _tocItems = [
    'Overview',
    'Danger Signs',
    'IV Artesunate',
    'Reconstitution',
    'Supportive Care',
    'Oral Step-Down',
  ];

  static const _ivRegimen = [
    {'time': '0h', 'action': 'IV Artesunate 2.4 mg/kg'},
    {'time': '12h', 'action': 'IV Artesunate 2.4 mg/kg'},
    {'time': '24h', 'action': 'IV Artesunate 2.4 mg/kg'},
    {'time': '48h', 'action': 'Complete course'},
  ];

  static const _redFlags = [
    'Cerebral malaria (Blantyre coma < 3)',
    'Severe anaemia (Hgb < 5 g/dL)',
    'Acute renal failure (oliguria < 0.5 mL/kg/h)',
    'Acute respiratory distress syndrome',
    'Repeated seizures despite treatment',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AfyaColors.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 120,
            floating: false,
            pinned: true,
            backgroundColor: AfyaColors.surface,
            surfaceTintColor: AfyaColors.surface,
            actions: [
              IconButton(
                icon: Icon(_bookmarked ? Icons.bookmark_rounded : Icons.bookmark_border_rounded),
                onPressed: () => setState(() => _bookmarked = !_bookmarked),
              ),
              IconButton(
                icon: const Icon(Icons.share_outlined),
                onPressed: () {},
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsets.only(left: 16, bottom: 16),
              title: Text(
                'Severe Malaria Protocol',
                style: AfyaTextStyles.titleMedium.copyWith(color: AfyaColors.onSurface),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: ListView(
              padding: const EdgeInsets.all(AfyaSpacing.md),
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: _tocItems.map((item) {
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: FilterChip(
                          label: Text(item, style: const TextStyle(fontSize: 12)),
                          onSelected: (value) {},
                          selected: _tocItems.first == item,
                          selectedColor: AfyaColors.primary,
                          labelStyle: TextStyle(
                            color: _tocItems.first == item ? Colors.white : AfyaColors.onSurface,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: AfyaSpacing.md),
                AfyaDisclaimer(
                  title: 'Clinical Decision Support',
                  message: 'This protocol is for trained clinicians only. Always verify with current MOH guidelines.',
                ),
                const SizedBox(height: AfyaSpacing.lg),
                Text('Emergency Triage: Danger Signs', style: AfyaTextStyles.titleMedium),
                const SizedBox(height: AfyaSpacing.sm),
                ..._redFlags.map((flag) {
                  return AfyaCard(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      dense: true,
                      leading: const Icon(Icons.warning_amber_rounded, color: AfyaColors.error, size: 20),
                      title: Text(flag, style: AfyaTextStyles.labelLarge),
                    ),
                  );
                }),
                const SizedBox(height: AfyaSpacing.lg),
                Text('Core IV Artesunate Regimen', style: AfyaTextStyles.titleMedium),
                const SizedBox(height: AfyaSpacing.sm),
                ..._ivRegimen.map((step) {
                  return AfyaCard(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      dense: true,
                      leading: Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: AfyaColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(AfyaRadius.full),
                        ),
                        child: Center(
                          child: Text(step['time'] as String, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AfyaColors.primary)),
                        ),
                      ),
                      title: Text(step['action'] as String, style: AfyaTextStyles.labelLarge),
                    ),
                  );
                }),
                const SizedBox(height: AfyaSpacing.lg),
                Text('Reconstitution Protocol', style: AfyaTextStyles.titleMedium),
                const SizedBox(height: AfyaSpacing.sm),
                ExpansionTile(
                  tilePadding: const EdgeInsets.symmetric(horizontal: 0),
                  title: Text('View reconstitution steps', style: AfyaTextStyles.labelLarge),
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 0, vertical: 8),
                      child: MarkdownBody(
                        data: '1. Reconstitute 60 mg vial with 1 mL sterile water.\n2. Dilute in 50 mL NS or D5W.\n3. Administer over 45-60 minutes.\n4. Do NOT administer IM or SC.',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AfyaSpacing.lg),
                Text('Supportive Care Modules', style: AfyaTextStyles.titleMedium),
                const SizedBox(height: AfyaSpacing.sm),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    FilterChip(label: const Text('Fluid Mgmt'), onSelected: (_) {}, selected: false, backgroundColor: AfyaColors.surfaceVariant),
                    FilterChip(label: const Text('Antipyretics'), onSelected: (_) {}, selected: false, backgroundColor: AfyaColors.surfaceVariant),
                    FilterChip(label: const Text('Seizure Control'), onSelected: (_) {}, selected: false, backgroundColor: AfyaColors.surfaceVariant),
                    FilterChip(label: const Text('Blood Transfusion'), onSelected: (_) {}, selected: false, backgroundColor: AfyaColors.surfaceVariant),
                    FilterChip(label: const Text('Monitoring'), onSelected: (_) {}, selected: false, backgroundColor: AfyaColors.surfaceVariant),
                  ],
                ),
                const SizedBox(height: AfyaSpacing.lg),
                Text('Oral Step-Down Transition', style: AfyaTextStyles.titleMedium),
                const SizedBox(height: AfyaSpacing.sm),
                const AfyaCard(
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text('Transition to ACT', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                        SizedBox(height: 4),
                        Text('Once tolerating oral intake, complete 3-day course of Artemisinin-based Combination Therapy per MOH guidelines.'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: AfyaSpacing.lg),
                Text('Red Flags & Clinical Warnings', style: AfyaTextStyles.titleMedium),
                const SizedBox(height: AfyaSpacing.sm),
                ..._redFlags.map((flag) {
                  return AfyaCard(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      dense: true,
                      leading: const Icon(Icons.report_problem_rounded, color: AfyaColors.error, size: 20),
                      title: Text(flag, style: AfyaTextStyles.labelLarge),
                    ),
                  );
                }),
                const SizedBox(height: AfyaSpacing.xxl),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
