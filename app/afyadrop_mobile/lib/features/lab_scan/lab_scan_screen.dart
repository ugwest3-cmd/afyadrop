import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/api.dart';
import '../../core/design_system.dart';

class LabScanScreen extends StatefulWidget {
  const LabScanScreen({super.key});

  @override
  State<LabScanScreen> createState() => _LabScanScreenState();
}

class _LabScanScreenState extends State<LabScanScreen> {
  String _scanType = 'lab';
  bool _analyzing = false;
  String? _selectedImageUrl;
  Map<String, dynamic>? _extractedData;

  final ImagePicker _picker = ImagePicker();

  final List<Map<String, String>> _topCases = [
    {'title': 'Complete Blood Count (CBC)', 'desc': 'Check for anemia, infection, and more'},
    {'title': 'Urinalysis', 'desc': 'Kidney function and UTI markers'},
    {'title': 'Liver Function Test (LFT)', 'desc': 'Check liver health and enzymes'},
    {'title': 'Lipid Panel', 'desc': 'Cholesterol and cardiovascular risk'},
  ];

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(source: source);
      if (image != null) {
        setState(() {
          _selectedImageUrl = image.path;
          _analyzing = true;
          _extractedData = null;
        });

        // 1. Upload to Supabase Storage
        final bytes = await image.readAsBytes();
        final fileName = 'scan_${DateTime.now().millisecondsSinceEpoch}_${image.name}';
        final storage = Supabase.instance.client.storage.from('lab-reports');
        await storage.uploadBinary(fileName, bytes, fileOptions: const FileOptions(upsert: true));
        final publicUrl = storage.getPublicUrl(fileName);

        // 2. Call API
        final api = AfyaDropApi();
        final prompt = _scanType == 'lab' 
          ? 'Analyze this lab report and extract the key biomarkers, their values, and identify any abnormal flags based on clinical guidelines. Format as a list of parameters.'
          : 'Analyze this clinical case document. Extract the patient history, symptoms, and suggest differential diagnoses based on clinical guidelines. Format clearly.';
          
        final res = await api.ask(prompt, imageUrl: publicUrl);
        final answer = res['answer']?.toString() ?? 'No clear analysis could be extracted.';

        if (mounted) {
          setState(() {
            _analyzing = false;
            // For now, put the whole answer into a single block to show the user
            _extractedData = {
              'Analysis Result': answer,
            };
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _analyzing = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error analyzing document: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AfyaColors.background,
      appBar: AppBar(
        title: Text('Smart Scan', style: AfyaTextStyles.titleLarge.copyWith(fontWeight: FontWeight.w700)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: AfyaColors.surfaceVariant,
                borderRadius: BorderRadius.circular(AfyaRadius.full),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _scanType = 'lab'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: _scanType == 'lab' ? AfyaColors.primary : Colors.transparent,
                          borderRadius: BorderRadius.circular(AfyaRadius.full),
                          boxShadow: _scanType == 'lab' ? [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 4)] : null,
                        ),
                        child: Center(
                          child: Text(
                            'Lab Report',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              color: _scanType == 'lab' ? Colors.white : Colors.grey[600],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _scanType = 'case'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: _scanType == 'case' ? AfyaColors.primary : Colors.transparent,
                          borderRadius: BorderRadius.circular(AfyaRadius.full),
                          boxShadow: _scanType == 'case' ? [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 4)] : null,
                        ),
                        child: Center(
                          child: Text(
                            'Clinical Case',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              color: _scanType == 'case' ? Colors.white : Colors.grey[600],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            GestureDetector(
              onTap: () => _pickImage(ImageSource.gallery),
              child: Container(
                height: 240,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AfyaColors.primary.withOpacity(0.2), width: 2),
                  boxShadow: [
                    BoxShadow(color: AfyaColors.primary.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, 10)),
                  ],
                ),
                child: _selectedImageUrl != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(22),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            Image.file(
                              File(_selectedImageUrl!),
                              fit: BoxFit.cover,
                            ),
                            if (_analyzing)
                              Container(
                                color: Colors.black54,
                                child: const Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    CircularProgressIndicator(color: Colors.white),
                                    SizedBox(height: 16),
                                    Text('Analyzing document...', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                                  ],
                                ),
                              ),
                          ],
                        ),
                      )
                    : Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AfyaColors.primary.withOpacity(0.1),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              _scanType == 'lab' ? Icons.science_outlined : Icons.description_outlined,
                              size: 40,
                              color: AfyaColors.primary,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            _scanType == 'lab' ? 'Scan or upload Lab Report' : 'Scan or upload Case Document',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Supported formats: JPG, PNG, PDF',
                            style: TextStyle(fontSize: 13, color: Colors.grey[500]),
                          ),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _pickImage(ImageSource.camera),
                    icon: const Icon(Icons.camera_alt_outlined, size: 20),
                    label: const Text('Take Photo'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AfyaColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 0,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _pickImage(ImageSource.gallery),
                    icon: const Icon(Icons.upload_file_rounded, size: 20),
                    label: const Text('Upload File'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AfyaColors.primary,
                      side: BorderSide(color: AfyaColors.primary.withOpacity(0.5)),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                  ),
                ),
              ],
            ),
            if (_extractedData != null) ...[
              const SizedBox(height: 32),
              Row(
                children: [
                  const Icon(Icons.check_circle_rounded, color: Colors.green, size: 24),
                  const SizedBox(width: 8),
                  Text('Analysis Complete', style: AfyaTextStyles.titleMedium),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4)),
                  ],
                ),
                child: ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _extractedData!.length,
                  separatorBuilder: (context, index) => Divider(height: 1, color: Colors.grey[100]),
                  itemBuilder: (context, index) {
                    final key = _extractedData!.keys.elementAt(index);
                    final value = _extractedData![key] as String;
                    final isFlag = key.toLowerCase().contains('flag');
                    return ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                      title: Text(key, style: TextStyle(fontSize: 13, color: Colors.grey[600], fontWeight: FontWeight.w500)),
                      subtitle: Text(
                        value,
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: isFlag ? Colors.orange[800] : Colors.black87,
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
            if (_extractedData == null) ...[
              const SizedBox(height: 40),
              Text('Suggested Scans', style: AfyaTextStyles.titleMedium),
              const SizedBox(height: 16),
              ..._topCases.map((c) => Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey[200]!),
                    ),
                    child: ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      leading: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AfyaColors.primary.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.description_outlined, color: AfyaColors.primary, size: 20),
                      ),
                      title: Text(c['title']!, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                      subtitle: Text(c['desc']!, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                      trailing: Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Colors.grey[400]),
                      onTap: () => _pickImage(ImageSource.gallery),
                    ),
                  )),
            ],
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
