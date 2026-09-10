import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/api.dart';
import '../../core/design_system.dart';
import '../../core/widgets/afya_input.dart';
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
  String? selectedCountry;
  bool loading = false;
  String? error;
  List<Map<String, dynamic>> countries = [];

  @override
  void initState() {
    super.initState();
    _loadCountries();
  }

  Future<void> _loadCountries() async {
    try {
      final result = await widget.api.countries();
      final list = List<Map<String, dynamic>>.from(result['countries'] ?? []);
      if (mounted) setState(() => countries = list);
    } catch (e) {
      // ignore
    }
  }

  Future<void> submit() async {
    if (selectedCountry == null) {
      setState(() => error = 'Please select a country to get started');
      return;
    }
    if (fullName.text.trim().isEmpty) {
      setState(() => error = 'Please enter your full name');
      return;
    }
    if (email.text.trim().isEmpty) {
      setState(() => error = 'Please enter your email');
      return;
    }
    if (password.text.trim().length < 6) {
      setState(() => error = 'Password must be at least 6 characters');
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
          'country': selectedCountry,
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
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: Image.asset(
                      'assets/images/afyadrop_logo.png',
                      height: 80,
                      fit: BoxFit.contain,
                    ),
                  ),
                  const SizedBox(height: 32),
                  Text(
                    'Create an Account',
                    style: AfyaTextStyles.headlineMedium.copyWith(fontWeight: FontWeight.w800),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Get instant clinical answers grounded in guidelines.',
                    style: AfyaTextStyles.bodyLarge.copyWith(color: Colors.grey[600]),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 32),
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
                            'You get 5 Free Credits when you register',
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
                  DropdownButtonFormField<String>(
                    decoration: InputDecoration(
                      labelText: 'Select Country',
                      prefixIcon: const Icon(Icons.public, size: 20),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(AfyaRadius.full)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    ),
                    items: countries
                        .map((c) => DropdownMenuItem(value: c['code']?.toString(), child: Text(c['name']?.toString() ?? c['code']?.toString() ?? '')))
                        .toList(),
                    onChanged: (value) => setState(() => selectedCountry = value),
                    icon: const Icon(Icons.arrow_drop_down),
                  ),
                  const SizedBox(height: 16),
                  AfyaInput(
                    controller: fullName,
                    label: 'Full Name',
                    hintText: 'Enter your full name',
                    prefixIcon: const Icon(Icons.person_outline, size: 20),
                  ),
                  const SizedBox(height: 16),
                  AfyaInput(
                    controller: email,
                    label: 'Email',
                    hintText: 'Enter your email address',
                    keyboardType: TextInputType.emailAddress,
                    prefixIcon: const Icon(Icons.email_outlined, size: 20),
                  ),
                  const SizedBox(height: 16),
                  AfyaInput(
                    controller: password,
                    label: 'Password',
                    hintText: 'Create a password (min 6 chars)',
                    obscureText: true,
                    prefixIcon: const Icon(Icons.lock_outline, size: 20),
                  ),
                  if (error != null) ...[
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AfyaColors.error.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(AfyaRadius.md),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.error_outline_rounded, color: AfyaColors.error, size: 20),
                          const SizedBox(width: 8),
                          Expanded(child: Text(error!, style: TextStyle(color: AfyaColors.error, fontSize: 14))),
                        ],
                      ),
                    ),
                  ],
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: loading ? null : submit,
                      style: ElevatedButton.styleFrom(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AfyaRadius.full)),
                        backgroundColor: AfyaColors.primary,
                        foregroundColor: Colors.white,
                      ),
                      child: Text(
                        loading ? 'Creating account...' : 'Create Account',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  TextButton(
                    onPressed: widget.onLoginTap,
                    child: RichText(
                      text: TextSpan(
                        text: 'Already have an account? ',
                        style: AfyaTextStyles.bodyMedium.copyWith(color: Colors.grey[700]),
                        children: [
                          TextSpan(
                            text: 'Sign in',
                            style: TextStyle(color: AfyaColors.primary, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    ),
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
