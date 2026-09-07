import 'package:flutter/material.dart';
import '../../../core/design_system.dart';
import '../../../core/widgets/afya_badge.dart';
import '../../../core/widgets/afya_card.dart';
import '../../../core/widgets/afya_disclaimer.dart';
import '../../../core/widgets/afya_input.dart';

class OfflineSyncScreen extends StatefulWidget {
  const OfflineSyncScreen({super.key});

  @override
  State<OfflineSyncScreen> createState() => _OfflineSyncScreenState();
}

class _OfflineSyncScreenState extends State<OfflineSyncScreen> {
  bool _isSyncing = false;
  double _storageUsed = 0.45;

  static const _countries = [
    {'code': 'UG', 'name': 'Uganda', 'size': '245 MB', 'downloaded': true},
    {'code': 'KE', 'name': 'Kenya', 'size': '230 MB', 'downloaded': true},
    {'code': 'TZ', 'name': 'Tanzania', 'size': '220 MB', 'downloaded': false},
    {'code': 'RW', 'name': 'Rwanda', 'size': '180 MB', 'downloaded': false},
    {'code': 'ZM', 'name': 'Zambia', 'size': '190 MB', 'downloaded': false},
  ];

  Future<void> _sync() async {
    setState(() => _isSyncing = true);
    await Future.delayed(const Duration(seconds: 2));
    setState(() => _isSyncing = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AfyaColors.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(AfyaSpacing.md),
          children: [
            Text('Offline Sync', style: AfyaTextStyles.headlineSmall),
            const SizedBox(height: AfyaSpacing.sm),
            Text(
              'Manage local guideline packs for offline use.',
              style: AfyaTextStyles.bodyMedium.copyWith(
                color: AfyaColors.onSurface.withOpacity(0.7),
              ),
            ),
            const SizedBox(height: AfyaSpacing.lg),
            AfyaCard(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: AfyaColors.primary.withOpacity(0.08),
                          borderRadius: BorderRadius.circular(AfyaRadius.md),
                        ),
                        child: Icon(Icons.cloud_sync_rounded, color: AfyaColors.primary, size: 24),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Sync Status', style: AfyaTextStyles.labelLarge.copyWith(fontWeight: FontWeight.w600)),
                            const SizedBox(height: 2),
                            Text(
                              _isSyncing ? 'Syncing...' : 'All packs up to date',
                              style: AfyaTextStyles.bodySmall.copyWith(
                                color: AfyaColors.onSurface.withOpacity(0.7),
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (_isSyncing)
                        const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AfyaColors.primary),
                        )
                      else
                        IconButton(
                          icon: const Icon(Icons.refresh_rounded, size: 20),
                          onPressed: _sync,
                        ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: AfyaSpacing.lg),
            AfyaDisclaimer(
              title: 'Medical Authority Disclaimer',
              message: 'Offline packs are sourced from official MOH channels. Content is for reference only.',
            ),
            const SizedBox(height: AfyaSpacing.lg),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('On-Device Diagnostic AI', style: AfyaTextStyles.labelLarge.copyWith(fontWeight: FontWeight.w600)),
                      const SizedBox(height: 4),
                      Text('Available offline', style: AfyaTextStyles.bodySmall),
                    ],
                  ),
                ),
                Switch(
                  value: true,
                  onChanged: (value) {},
                  activeColor: AfyaColors.primary,
                ),
              ],
            ),
            const SizedBox(height: AfyaSpacing.lg),
            Text('Country Pack Management', style: AfyaTextStyles.titleMedium),
            const SizedBox(height: AfyaSpacing.sm),
            ..._countries.map((country) {
              final countryColor = AfyaColors.countryColor(country['code'] as String);
              return AfyaCard(
                margin: const EdgeInsets.only(bottom: AfyaSpacing.sm),
                child: ListTile(
                  leading: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: countryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(AfyaRadius.md),
                    ),
                    child: Center(
                      child: Text(
                        country['code'] as String,
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 12,
                          color: countryColor,
                        ),
                      ),
                    ),
                  ),
                  title: Text(country['name'] as String, style: AfyaTextStyles.labelLarge),
                  subtitle: Text(country['size'] as String, style: AfyaTextStyles.bodySmall),
                  trailing: Switch(
                    value: country['downloaded'] as bool,
                    onChanged: (value) {},
                    activeColor: AfyaColors.primary,
                  ),
                ),
              );
            }),
            const SizedBox(height: AfyaSpacing.lg),
            Text('Storage & Bandwidth', style: AfyaTextStyles.titleMedium),
            const SizedBox(height: AfyaSpacing.sm),
            AfyaCard(
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Storage Used', style: AfyaTextStyles.labelLarge),
                      Text('${(_storageUsed * 1000).toInt()} MB', style: AfyaTextStyles.bodySmall),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(AfyaRadius.sm),
                    child: LinearProgressIndicator(
                      value: _storageUsed,
                      minHeight: 8,
                      backgroundColor: AfyaColors.surfaceVariant,
                      valueColor: const AlwaysStoppedAnimation(AfyaColors.primary),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AfyaSpacing.xxl),
          ],
        ),
      ),
    );
  }
}
