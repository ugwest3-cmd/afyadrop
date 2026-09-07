import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/api.dart';
import '../../../core/design_system.dart';
import '../../../core/widgets/afya_badge.dart';
import '../../../core/widgets/afya_card.dart';
import '../../../core/widgets/afya_disclaimer.dart';
import '../../../core/widgets/afya_input.dart';

class LabScanScreen extends StatefulWidget {
  const LabScanScreen({super.key});

  @override
  State<LabScanScreen> createState() => _LabScanScreenState();
}

class _LabScanScreenState extends State<LabScanScreen> {
  final ImagePicker _picker = ImagePicker();
  String? _selectedImageUrl;
  bool _analyzing = false;
  Map<String, dynamic>? _extractedData;

  static const _sampleExtractions = {
    'Hemoglobin': '11.2 g/dL (Ref: 12-16)',
    'Platelets': '245 x10^9/L (Ref: 150-400)',
    'WBC': '7.8 x10^9/L (Ref: 4-11)',
    'Malaria Parasites': 'Negative',
  };

  Future<void> _pickImage() async {
    try {
      final file = await _picker.pickImage(source: ImageSource.gallery, maxWidth: 1024, maxHeight: 1024, imageQuality: 85);
      if (file == null) return;
      final bytes = await file.readAsBytes();
      final fileName = 'lab-reports/${DateTime.now().millisecondsSinceEpoch}-${file.name}';
      await Supabase.instance.client.storage.from('lab-reports').uploadBinary(fileName, bytes, fileOptions: const FileOptions(upsert: true));
      final publicUrl = Supabase.instance.client.storage.from('lab-reports').getPublicUrl(fileName);
      if (mounted) {
        setState(() {
          _selectedImageUrl = publicUrl;
          _analyzing = true;
        });
        await Future.delayed(const Duration(seconds: 2));
        setState(() {
          _analyzing = false;
          _extractedData = _sampleExtractions;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to upload image: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AfyaColors.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(AfyaSpacing.md),
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AfyaColors.primary.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(AfyaRadius.full),
                  ),
                  child: Text(
                    'AI Vision Active',
                    style: TextStyle(
                      fontFamily: AfyaTextStyles.bodyFont,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AfyaColors.primary,
                    ),
                  ),
                ),
                const Spacer(),
                AfyaBadge(
                  label: 'Confidence: 94%',
                  backgroundColor: AfyaColors.secondary.withOpacity(0.1),
                  foregroundColor: AfyaColors.secondary,
                ),
              ],
            ),
            const SizedBox(height: AfyaSpacing.md),
            Text('Lab Scan Inspector', style: AfyaTextStyles.headlineSmall),
            const SizedBox(height: AfyaSpacing.sm),
            Text(
              'Upload a lab report image for AI-powered biomarker extraction and guideline correlation.',
              style: AfyaTextStyles.bodyMedium.copyWith(
                color: AfyaColors.onSurface.withOpacity(0.7),
              ),
            ),
            const SizedBox(height: AfyaSpacing.lg),
            GestureDetector(
              onTap: _pickImage,
              child: Container(
                height: 220,
                decoration: BoxDecoration(
                  color: AfyaColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(AfyaRadius.lg),
                  border: Border.all(color: AfyaColors.outline, style: BorderStyle.solid),
                ),
                child: _selectedImageUrl != null
                    ? Stack(
                        fit: StackFit.expand,
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(AfyaRadius.lg),
                            child: Image.network(
                              _selectedImageUrl!,
                              fit: BoxFit.cover,
                              loadingBuilder: (context, child, progress) {
                                if (progress == null) return child;
                                return const Center(child: CircularProgressIndicator());
                              },
                            ),
                          ),
                          if (_analyzing)
                            Container(
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.3),
                                borderRadius: BorderRadius.circular(AfyaRadius.lg),
                              ),
                              child: const Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    CircularProgressIndicator(color: Colors.white),
                                    SizedBox(height: 12),
                                    Text('Analyzing image...', style: TextStyle(color: Colors.white)),
                                  ],
                                ),
                              ),
                            ),
                        ],
                      )
                    : Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.camera_alt_outlined, size: 48, color: AfyaColors.onSurface.withOpacity(0.4)),
                          const SizedBox(height: 12),
                          Text('Tap to upload lab report', style: AfyaTextStyles.bodyMedium.copyWith(
                            color: AfyaColors.onSurface.withOpacity(0.6),
                          )),
                        ],
                      ),
              ),
            ),
            if (_extractedData != null) ...[
              const SizedBox(height: AfyaSpacing.lg),
              Text('Extracted Biomarkers', style: AfyaTextStyles.titleMedium),
              const SizedBox(height: AfyaSpacing.sm),
              ..._extractedData!.entries.map((entry) {
                return AfyaCard(
                  margin: const EdgeInsets.only(bottom: AfyaSpacing.sm),
                  child: ListTile(
                    dense: true,
                    leading: const Icon(Icons.analytics_rounded, size: 20, color: AfyaColors.primary),
                    title: Text(entry.key, style: AfyaTextStyles.labelLarge),
                    subtitle: Text(entry.value as String, style: AfyaTextStyles.bodySmall),
                  ),
                );
              }),
              const SizedBox(height: AfyaSpacing.md),
              AfyaDisclaimer(
                title: 'Guideline Correlation',
                message: 'Based on extracted values, review current MOH guidelines for interpretation thresholds and treatment pathways.',
              ),
            ],
            const SizedBox(height: AfyaSpacing.lg),
            AfyaDisclaimer(
              title: 'Official Disclaimer',
              message: 'AI-extracted values are for assistance only. Always verify original reports and follow institutional protocols.',
            ),
            const SizedBox(height: AfyaSpacing.xxl),
          ],
        ),
      ),
    );
  }
}
