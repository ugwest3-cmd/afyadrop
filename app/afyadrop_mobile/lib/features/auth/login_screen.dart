import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/api.dart';
import '../../core/design_system.dart';
import '../../core/widgets/afya_input.dart';
import '../auth/complete_profile_screen.dart';
import '../auth/register_screen.dart';
import '../auth/enter_email_otp_screen.dart';
import '../main/main_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key, required this.api, this.onRegisterTap});
  final AfyaDropApi api;
  final VoidCallback? onRegisterTap;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final email = TextEditingController();
  final password = TextEditingController();
  bool loading = false;
  String? error;

  Future<void> submit() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      await Supabase.instance.client.auth.signInWithPassword(
        email: email.text.trim(),
        password: password.text.trim(),
      );
      if (!mounted) return;
      final profileResult = await widget.api.me();
      final user = Map<String, dynamic>.from(profileResult['user'] ?? {});
      if (user['profile_completed'] == true) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => MainScreen(api: widget.api)),
        );
      } else {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => CompleteProfileScreen(api: widget.api)),
        );
      }
    } catch (e) {
      final message = await widget.api.errorMessage(e) ?? e.toString();
      if (mounted) setState(() => error = message);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  void _otpLogin() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => EnterEmailOtpScreen(api: widget.api)),
    );
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
                  const SizedBox(height: 60),
                  Center(
                    child: Image.asset(
                      'assets/images/afyadrop_logo.png',
                      height: 80,
                      fit: BoxFit.contain,
                    ),
                  ),
                  const SizedBox(height: 40),
                  Text(
                    'Welcome back',
                    style: AfyaTextStyles.headlineMedium.copyWith(fontWeight: FontWeight.w800),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Sign in to access clinical decision support',
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
                  const SizedBox(height: 16),
                  AfyaInput(
                    controller: password,
                    label: 'Password',
                    hintText: 'Enter your password',
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
                        loading ? 'Signing in...' : 'Sign in',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: OutlinedButton.icon(
                      onPressed: loading ? null : _otpLogin,
                      icon: const Icon(Icons.mail_outline_rounded, size: 20),
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AfyaRadius.full)),
                        side: BorderSide(color: AfyaColors.primary),
                        foregroundColor: AfyaColors.primary,
                      ),
                      label: const Text(
                        'Sign in with Email OTP',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  TextButton(
                    onPressed: widget.onRegisterTap ??
                        () => Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => RegisterScreen(
                                  api: widget.api,
                                  onLoginTap: () => Navigator.of(context).pop(),
                                ),
                              ),
                            ),
                    child: RichText(
                      text: TextSpan(
                        text: 'Don\'t have an account? ',
                        style: AfyaTextStyles.bodyMedium.copyWith(color: Colors.grey[700]),
                        children: [
                          TextSpan(
                            text: 'Create one',
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
