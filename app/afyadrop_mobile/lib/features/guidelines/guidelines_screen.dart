import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/design_system.dart';
import '../../core/widgets/afya_badge.dart';
import '../../core/widgets/afya_card.dart';
import '../../core/widgets/afya_chip.dart';
import '../../core/widgets/afya_country_selector.dart';
import '../../core/widgets/afya_disclaimer.dart';
import '../../core/widgets/afya_input.dart';
import 'protocol_detail_screen.dart';
import '../drug_calculator/drug_calculator_screen.dart';

class GuidelinesScreen extends StatefulWidget {
  const GuidelinesScreen({super.key});

  @override
  State<GuidelinesScreen> createState() => _GuidelinesScreenState();
}

class _GuidelinesScreenState extends State<GuidelinesScreen> {
  String _selectedCountry = 'UG';
  final _searchController = TextEditingController();
  bool _isOffline = false;

  static const _emergencyProtocols = [
    {'title': 'Severe Malaria', 'subtitle': 'UCG 2023'},
    {'title': 'Postpartum Haemorrhage', 'subtitle': 'Emergency OB'},
    {'title': 'Anaphylaxis & Asthma', 'subtitle': 'Emergency Paeds'},
  ];

  static const _clinicalDomains = [
    {'icon': Icons.psychology_outlined, 'title': 'Diagnosis Support', 'color': Color(0xFF00373c)},
    {'icon': Icons.medication_outlined, 'title': 'Treatment Plans', 'color': Color(0xFF006c49)},
    {'icon': Icons.calculate_outlined, 'title': 'Drug Dosing', 'color': Color(0xFF075985)},
    {'icon': Icons.warning_amber_outlined, 'title': 'Interactions & C/I', 'color': Color(0xFF991B1B)},
    {'icon': Icons.coronavirus_outlined, 'title': 'Infectious Diseases', 'color': Color(0xFF15803D)},
    {'icon': Icons.favorite_outline_rounded, 'title': 'Maternal & Child', 'color': Color(0xFF854D0E)},
  ];

  static const _frequentlyReferenced = [
    {'title': 'UCG 2023 - Malaria', 'subtitle': 'Updated Jun 2026'},
    {'title': 'MOH Malaria Guidelines', 'subtitle': 'Standard Protocol'},
    {'title': 'Paediatric Sepsis', 'subtitle': 'Emergency Pathway'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AfyaColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            await Future.delayed(const Duration(milliseconds: 800));
            setState(() {});
          },
          child: ListView(
            padding: const EdgeInsets.all(AfyaSpacing.md),
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      'Guidelines',
                      style: AfyaTextStyles.headlineSmall,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: _isOffline ? AfyaColors.kenya.withOpacity(0.1) : AfyaColors.secondary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(AfyaRadius.full),
                    ),
                    child: Text(
                      _isOffline ? 'Offline Mode' : 'Synced',
                      style: TextStyle(
                        fontFamily: AfyaTextStyles.bodyFont,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: _isOffline ? AfyaColors.kenya : AfyaColors.secondary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AfyaSpacing.md),
              AfyaInput(
                controller: _searchController,
                hintText: 'Search protocols, guidelines...',
                prefixIcon: const Icon(Icons.search_rounded, size: 20),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.mic_rounded, size: 20),
                  onPressed: () {},
                ),
              ),
              const SizedBox(height: AfyaSpacing.md),
              AfyaCountrySelector(
                selectedCode: _selectedCountry,
                onSelected: (code) => setState(() => _selectedCountry = code ?? _selectedCountry),
              ),
              const SizedBox(height: AfyaSpacing.sm),
              Center(
                child: AfyaBadge(
                  label: 'Live: Uganda Clinical Guidelines (UCG 2023)',
                  backgroundColor: AfyaColors.primary.withOpacity(0.08),
                  foregroundColor: AfyaColors.primary,
                  icon: Icon(Icons.verified_rounded, size: 12, color: AfyaColors.primary),
                ),
              ),
              const SizedBox(height: AfyaSpacing.lg),
              Text('Fast Emergency Protocols', style: AfyaTextStyles.titleMedium),
              const SizedBox(height: AfyaSpacing.sm),
              SizedBox(
                height: 140,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: _emergencyProtocols.length,
                  separatorBuilder: (_, __) => const SizedBox(width: AfyaSpacing.sm),
                  itemBuilder: (context, index) {
                    final protocol = _emergencyProtocols[index];
                    return GestureDetector(
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                          builder: (_) => ProtocolDetailScreen(),
                          ),
                        );
                      },
                      child: Container(
                        width: 200,
                        padding: const EdgeInsets.all(AfyaSpacing.md),
                        decoration: BoxDecoration(
                          color: AfyaColors.surface,
                          borderRadius: BorderRadius.circular(AfyaRadius.lg),
                          border: Border.all(color: AfyaColors.outlineVariant),
                          boxShadow: [
                            BoxShadow(
                              color: AfyaColors.shadow,
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.emergency_rounded, color: AfyaColors.error, size: 28),
                            const SizedBox(height: 8),
                            Text(
                              protocol['title'] as String,
                              style: AfyaTextStyles.titleSmall,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              protocol['subtitle'] as String,
                              style: AfyaTextStyles.bodySmall.copyWith(
                                color: AfyaColors.onSurface.withOpacity(0.6),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: AfyaSpacing.lg),
              AfyaDisclaimer(
                title: 'Clinical Decision Support',
                message: 'All protocols are for reference only. Always verify with current MOH guidelines and clinical judgment.',
              ),
              const SizedBox(height: AfyaSpacing.lg),
              Text('Clinical Domains', style: AfyaTextStyles.titleMedium),
              const SizedBox(height: AfyaSpacing.sm),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  childAspectRatio: 1.1,
                  crossAxisSpacing: 8,
                  mainAxisSpacing: 8,
                ),
                itemCount: _clinicalDomains.length,
                itemBuilder: (context, index) {
                  final domain = _clinicalDomains[index];
                  return GestureDetector(
                    onTap: () {},
                    child: Container(
                      decoration: BoxDecoration(
                        color: AfyaColors.surface,
                        borderRadius: BorderRadius.circular(AfyaRadius.lg),
                        border: Border.all(color: AfyaColors.outlineVariant),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(domain['icon'] as IconData, color: domain['color'] as Color, size: 28),
                          const SizedBox(height: 8),
                          Text(
                            domain['title'] as String,
                            textAlign: TextAlign.center,
                            style: AfyaTextStyles.labelMedium.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: AfyaSpacing.lg),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Frequently Referenced', style: AfyaTextStyles.titleMedium),
                  TextButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.arrow_forward_ios_rounded, size: 16),
                    label: const Text('See all'),
                  ),
                ],
              ),
              const SizedBox(height: AfyaSpacing.sm),
              ..._frequentlyReferenced.map((item) {
                return AfyaCard(
                  margin: const EdgeInsets.only(bottom: AfyaSpacing.sm),
                  child: ListTile(
                    leading: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: AfyaColors.primary.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(AfyaRadius.md),
                      ),
                      child: Icon(Icons.menu_book_rounded, color: AfyaColors.primary, size: 20),
                    ),
                    title: Text(item['title'] as String, style: AfyaTextStyles.labelLarge),
                    subtitle: Text(item['subtitle'] as String, style: AfyaTextStyles.bodySmall),
                    trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16),
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => ProtocolDetailScreen(),
                        ),
                      );
                    },
                  ),
                );
              }),
              const SizedBox(height: AfyaSpacing.xxl),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => DrugCalculatorScreen(),
            ),
          );
        },
        backgroundColor: AfyaColors.secondary,
        foregroundColor: AfyaColors.onSecondary,
        icon: const Icon(Icons.calculate_rounded, size: 20),
        label: const Text('Dose Calculator'),
      ),
    );
  }
}
