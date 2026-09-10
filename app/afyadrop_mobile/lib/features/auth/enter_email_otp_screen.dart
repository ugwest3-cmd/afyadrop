import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/api.dart';
import '../../core/design_system.dart';
import '../../core/widgets/afya_input.dart';
import 'verify_otp_screen.dart';

class EnterEmailOtpScreen extends StatefulWidget {
  const EnterEmailOtpScreen({super.key, required this.api});
  final AfyaDropApi api;

  @override
  State<EnterEmailOtpScreen> createState() => _EnterEmailOtpScreenState();
}

class _EnterEmailOtpScreenState extends State<EnterEmailOtpScreen> {
  final email = TextEditingController();
  bool loading = false;
  String? error;

  Future<void> submit() async {
    final userEmail = email.text.trim();
    if (userEmail.isEmpty) {
      setState(() => error = 'Enter your email first');
      return;
    }
    setState(() {
      loading = true;
      error = null;
    });
    try {
      await Supabase.instance.client.auth.signInWithOtp(email: userEmail);
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => VerifyOtpScreen(api: widget.api, email: userEmail),
        ),
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
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: const BackButton(color: AfyaColors.primary),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 20),
                  Text(
                    'Sign in with OTP',
                    style: AfyaTextStyles.headlineMedium.copyWith(fontWeight: FontWeight.w800),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'We will send an 8-digit one-time passcode to your email.',
                    style: AfyaTextStyles.bodyLarge.copyWith(color: Colors.grey[600]),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 48),
                  AfyaInput(
                    controller: email,
                    label: 'Email',
                    hintText: 'Enter your email address',
                    keyboardType: TextInputType.emailAddress,
                    prefixIcon: const Icon(Icons.email_outlined, size: 20),
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
                        loading ? 'Sending code...' : 'Send OTP',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
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
