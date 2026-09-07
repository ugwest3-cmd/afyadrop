import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/api.dart';
import '../../core/design_system.dart';
import 'verify_email_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key, required this.api, required this.onLoginTap});
  final AfyaDropApi api;
  final VoidCallback onLoginTap;

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final fullName = TextEditingController();
  final email = TextEditingController();
  final password = TextEditingController();
  final licenceNumber = TextEditingController();
  final facility = TextEditingController();
  final ward = TextEditingController();
  final pesapalContact = TextEditingController();

  String? selectedCouncil;
  String selectedCadre = 'Medical Officer';
  bool loading = false;
  String? error;
  bool licenceVerified = false;

  static const _councils = [
    {'code': 'UMDPC', 'name': 'Uganda Medical & Dental Practitioners Council (UMDPC)'},
    {'code': 'KMPDC', 'name': 'Kenya Medical Practitioners and Dentists Council (KMPDC)'},
    {'code': 'MCT', 'name': 'Medical Council of Tanganyika (MCT)'},
    {'code': 'RMDC', 'name': 'Rwanda Medical and Dental Practitioners Council (RMDC)'},
    {'code': 'HPCZ', 'name': 'Health Professions Council of Zambia (HPCZ)'},
  ];

  static const _cadres = [
    'Medical Officer',
    'Clinical Officer',
    'Paediatrician',
    'Nurse Practitioner',
    'Pharmacist',
  ];

  Future<void> submit() async {
    if (selectedCouncil == null) {
      setState(() => error = 'Please select your licensing council');
      return;
    }
    if (fullName.text.trim().isEmpty) {
      setState(() => error = 'Please enter your full legal name');
      return;
    }
    if (licenceNumber.text.trim().isEmpty) {
      setState(() => error = 'Please enter your licence number');
      return;
    }
    setState(() {
      loading = true;
      error = null;
    });
    try {
      await Supabase.instance.client.auth.signUp(
        email: email.text.trim(),
        password: password.text.trim(),
        data: {
          'full_name': fullName.text.trim(),
          'council': selectedCouncil,
          'cadre': selectedCadre,
          'licence_number': licenceNumber.text.trim(),
          'facility': facility.text.trim(),
          'ward': ward.text.trim(),
          'pesapal_contact': pesapalContact.text.trim(),
        },
      );
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => VerifyEmailScreen(api: widget.api, email: email.text.trim())),
      );
    } catch (e) {
      final message = await widget.api.errorMessage(e) ?? e.toString();
      if (mounted) setState(() => error = message);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AfyaColors.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 600),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          children: [
                            Container(
                              height: 4,
                              decoration: BoxDecoration(
                                color: AfyaColors.primary,
                                borderRadius: BorderRadius.circular(2),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text('Step 2 of 2', style: AfyaTextStyles.labelSmall.copyWith(color: AfyaColors.primary)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF3CD),
                      borderRadius: BorderRadius.circular(AfyaRadius.md),
                      border: Border.all(color: const Color(0xFFFFE69C)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.card_giftcard_rounded, color: Color(0xFF856404), size: 20),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'You have 5 Free Credits to explore AfyaDrop',
                            style: TextStyle(
                              fontFamily: AfyaTextStyles.bodyFont,
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF856404),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text('Clinician Registration', style: AfyaTextStyles.headlineSmall),
                  const SizedBox(height: 8),
                  Text(
                    'Complete your professional registration for verification.',
                    style: AfyaTextStyles.bodyMedium.copyWith(
                      color: AfyaColors.onSurface.withOpacity(0.7),
                    ),
                  ),
                  const SizedBox(height: 24),
                  TextField(
                    controller: fullName,
                    decoration: const InputDecoration(
                      labelText: 'Full Legal Name',
                      hintText: 'As it appears on your practising licence',
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text('Licensing Council', style: AfyaTextStyles.labelMedium),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _councils.map((council) {
                      final isSelected = selectedCouncil == council['code'];
                      return FilterChip(
                        label: Text(council['code'] as String, style: const TextStyle(fontSize: 12)),
                        selected: isSelected,
                        onSelected: (value) => setState(() => selectedCouncil = value ? council['code'] as String : null),
                        selectedColor: AfyaColors.countryColor(council['code'] as String),
                        checkmarkColor: Colors.white,
                        labelStyle: TextStyle(color: isSelected ? Colors.white : AfyaColors.onSurface),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: licenceNumber,
                    decoration: InputDecoration(
                      labelText: 'Council Licence / Reg Number',
                      suffixIcon: licenceVerified
                          ? const Icon(Icons.verified_rounded, color: AfyaColors.secondary, size: 18)
                          : null,
                    ),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    decoration: const InputDecoration(labelText: 'Cadre / Qualification'),
                    initialValue: selectedCadre,
                    items: _cadres
                        .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                        .toList(),
                    onChanged: (value) => setState(() => selectedCadre = value ?? selectedCadre),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: facility,
                          decoration: const InputDecoration(labelText: 'Health Facility'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: ward,
                          decoration: const InputDecoration(labelText: 'Ward / Department'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: pesapalContact,
                    decoration: const InputDecoration(
                      labelText: 'Contact for PesaPal Receipts',
                      hintText: 'Mobile money number',
                    ),
                    keyboardType: TextInputType.phone,
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AfyaColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(AfyaRadius.sm),
                    ),
                    child: Text(
                      'By registering, you confirm that the information provided is accurate and you hold a current licence from the selected council.',
                      style: AfyaTextStyles.bodySmall.copyWith(
                        color: AfyaColors.onSurface.withOpacity(0.7),
                      ),
                    ),
                  ),
                  if (error != null) ...[
                    const SizedBox(height: 12),
                    Text(error!, style: const TextStyle(color: AfyaColors.error)),
                  ],
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: loading ? null : submit,
                      child: Text(loading ? 'Registering...' : 'Complete Registration'),
                    ),
                  ),
                  TextButton(
                    onPressed: widget.onLoginTap,
                    child: const Text('Already have an account? Sign in'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
