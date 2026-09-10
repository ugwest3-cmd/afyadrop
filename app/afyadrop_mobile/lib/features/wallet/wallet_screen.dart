import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/api.dart';
import '../../core/design_system.dart';
import '../../core/widgets/afya_badge.dart';
import '../../core/widgets/afya_card.dart';
import '../../core/widgets/afya_chip.dart';
import '../../core/widgets/afya_disclaimer.dart';
import '../../core/widgets/afya_input.dart';
import '../profile/profile_screen.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key, required this.api, this.showAppBar = false});
  final AfyaDropApi api;
  final bool showAppBar;

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  Map<String, dynamic>? profile;
  bool loading = true;
  String? error;
  String? selectedPackage;
  final phoneController = TextEditingController();

  static const _packages = [
    {'credits': 10, 'price': '2,500 UGX', 'label': 'Starter', 'popular': false},
    {'credits': 25, 'price': '5,000 UGX', 'label': 'Popular Clinician', 'popular': true},
    {'credits': 60, 'price': '15,000 UGX', 'label': 'Ward Bundle', 'popular': false},
  ];

  static const _providers = [
    {'name': 'MTN MoMo', 'icon': Icons.phone_android_rounded},
    {'name': 'Airtel Money', 'icon': Icons.wifi_rounded},
    {'name': 'M-Pesa', 'icon': Icons.payments_rounded},
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final result = await widget.api.me();
      if (mounted) setState(() => profile = Map<String, dynamic>.from(result['user'] ?? {}));
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> purchase(int credits) async {
    final userId = profile?['id']?.toString();
    if (userId == null) return;
    setState(() => error = null);
    try {
      final result = await widget.api.purchase(userId, credits);
      final redirectUrl = result['redirect_url']?.toString();
      if (redirectUrl != null && mounted) {
        final uri = Uri.parse(redirectUrl);
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        }
      }
    } catch (e) {
      final message = await widget.api.errorMessage(e) ?? e.toString();
      if (mounted) setState(() => error = message);
    }
  }

  @override
  Widget build(BuildContext context) {
    final balance = profile?['balance_credits'] ?? 0;
    return Scaffold(
      backgroundColor: AfyaColors.background,
      appBar: widget.showAppBar ? AppBar(
        title: const Text('Wallet'),
        actions: [
              IconButton(icon: const Icon(Icons.person_outline_rounded), onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => ProfileScreen(api: widget.api)))),
        ],
      ) : null,
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  if (!widget.showAppBar) ...[
                    Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: AfyaColors.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(AfyaRadius.md),
                          ),
                          child: Icon(Icons.badge_rounded, color: AfyaColors.primary, size: 22),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(profile?['full_name']?.toString() ?? 'Doctor', style: AfyaTextStyles.labelLarge.copyWith(fontWeight: FontWeight.w600)),
                              Text(profile?['qualification']?.toString() ?? '', style: AfyaTextStyles.bodySmall),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AfyaColors.secondary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(AfyaRadius.full),
                          ),
                          child: Text(
                            'Licensed',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AfyaColors.secondary),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                  ],
                  AfyaCard(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Balance', style: AfyaTextStyles.titleMedium),
                            Text('Credits', style: AfyaTextStyles.bodySmall),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text('$balance', style: AfyaTextStyles.headlineMedium.copyWith(color: AfyaColors.primary, fontWeight: FontWeight.w700)),
                        const SizedBox(height: 12),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(AfyaRadius.sm),
                          child: LinearProgressIndicator(
                            value: (balance / 100).clamp(0.0, 1.0),
                            minHeight: 8,
                            backgroundColor: AfyaColors.surfaceVariant,
                            valueColor: const AlwaysStoppedAnimation(AfyaColors.primary),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text('Usage tracker', style: AfyaTextStyles.bodySmall.copyWith(
                          color: AfyaColors.onSurface.withOpacity(0.6),
                        )),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AfyaColors.primary.withOpacity(0.06),
                      borderRadius: BorderRadius.circular(AfyaRadius.md),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.info_outline_rounded, size: 18, color: AfyaColors.primary),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Transparent Pricing: 100 UGX per query',
                            style: AfyaTextStyles.bodySmall.copyWith(
                              fontWeight: FontWeight.w600,
                              color: AfyaColors.primary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text('Credit Top-up Packages', style: AfyaTextStyles.titleMedium),
                  const SizedBox(height: 8),
                  ..._packages.map((pkg) {
                    final isSelected = selectedPackage == pkg['label'];
                    return GestureDetector(
                      onTap: () => setState(() => selectedPackage = pkg['label'] as String),
                      child: AfyaCard(
                        margin: const EdgeInsets.only(bottom: 8),
                        color: isSelected ? AfyaColors.primary.withOpacity(0.04) : null,
                        borderColor: isSelected ? AfyaColors.primary : AfyaColors.outlineVariant,
                        borderWidth: isSelected ? 2 : 1,
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(pkg['label'] as String, style: AfyaTextStyles.labelLarge.copyWith(fontWeight: FontWeight.w600)),
                                      if (pkg['popular'] == true) ...[
                                        const SizedBox(width: 8),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: AfyaColors.secondary,
                                            borderRadius: BorderRadius.circular(AfyaRadius.full),
                                          ),
                                          child: Text('Popular', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Colors.white)),
                                        ),
                                      ],
                                    ],
                                  ),
                                  const SizedBox(height: 2),
                                  Text('${pkg['credits']} credits', style: AfyaTextStyles.bodyMedium),
                                ],
                              ),
                            ),
                            Text(pkg['price'] as String, style: AfyaTextStyles.titleSmall.copyWith(color: AfyaColors.primary)),
                          ],
                        ),
                      ),
                    );
                  }),
                  const SizedBox(height: 24),
                  const SizedBox(height: 24),
                  Text('How to top up', style: AfyaTextStyles.titleMedium),
                  const SizedBox(height: 12),
                  AfyaCard(
                    color: AfyaColors.surfaceVariant,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.public, color: AfyaColors.primary),
                              const SizedBox(width: 8),
                              Text('Visit Web Portal', style: AfyaTextStyles.titleSmall),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'To comply with billing policies, please purchase credits via our secure web dashboard at portal.afyadrop.com using your browser.',
                            style: AfyaTextStyles.bodyMedium,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text('Recent Transactions', style: AfyaTextStyles.titleMedium),
                  const SizedBox(height: 8),
                  ...List.generate(3, (index) {
                    return AfyaCard(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        dense: true,
                        leading: const Icon(Icons.receipt_long_rounded, size: 20, color: AfyaColors.primary),
                        title: Text('Credit purchase', style: AfyaTextStyles.labelLarge),
                        subtitle: Text('2 days ago', style: AfyaTextStyles.bodySmall),
                        trailing: Text('+${[25, 50, 10][index]}', style: AfyaTextStyles.labelLarge.copyWith(color: AfyaColors.secondary)),
                      ),
                    );
                  }),
                  const SizedBox(height: 16),
                  AfyaDisclaimer(
                    title: 'Clinical Decision Support Disclaimer',
                    message: 'Credits are consumed per query. Purchases are non-refundable except as required by law.',
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          );
  }
}
