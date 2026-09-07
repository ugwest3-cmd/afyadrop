import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/api.dart';
import '../../core/design_system.dart';
import '../../core/widgets/afya_badge.dart';
import '../../core/widgets/afya_card.dart';
import '../../core/widgets/afya_disclaimer.dart';
import '../auth/login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key, this.api});
  final AfyaDropApi? api;

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? profile;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final api = widget.api;
      if (api != null) {
        final result = await api.me();
        if (mounted) setState(() => profile = Map<String, dynamic>.from(result['user'] ?? {}));
      }
    } catch (e) {
      // ignore
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> logout() async {
    await Supabase.instance.client.auth.signOut();
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => LoginScreen(api: widget.api!)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AfyaColors.background,
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          TextButton.icon(
            onPressed: logout,
            icon: const Icon(Icons.logout_rounded, size: 18),
            label: const Text('Logout'),
          ),
        ],
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Center(
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 36,
                          backgroundColor: AfyaColors.primary.withOpacity(0.1),
                          child: Text(
                            (profile?['full_name']?.toString() ?? 'U').substring(0, 1).toUpperCase(),
                            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: AfyaColors.primary),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(profile?['full_name']?.toString() ?? '', style: AfyaTextStyles.titleMedium),
                        const SizedBox(height: 4),
                        Text(profile?['qualification']?.toString() ?? '', style: AfyaTextStyles.bodyMedium.copyWith(
                          color: AfyaColors.onSurface.withOpacity(0.7),
                        )),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  AfyaCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        _ProfileRow(label: 'Name', value: profile?['full_name']?.toString() ?? ''),
                        const Divider(height: 24),
                        _ProfileRow(label: 'Email', value: profile?['email']?.toString() ?? ''),
                        const Divider(height: 24),
                        _ProfileRow(label: 'Country', value: profile?['country']?.toString() ?? ''),
                        const Divider(height: 24),
                        _ProfileRow(label: 'Qualification', value: profile?['qualification']?.toString() ?? ''),
                        const Divider(height: 24),
                        _ProfileRow(label: 'Licence number', value: profile?['licence_number']?.toString() ?? ''),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  AfyaDisclaimer(
                    title: 'Data Privacy',
                    message: 'Your profile data is encrypted and stored securely. Contact support for updates to your licence details.',
                  ),
                ],
              ),
            ),
          );
  }
}

class _ProfileRow extends StatelessWidget {
  const _ProfileRow({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(label, style: AfyaTextStyles.bodySmall.copyWith(
              color: AfyaColors.onSurface.withOpacity(0.7),
            )),
          ),
          Expanded(
            child: Text(value, style: AfyaTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }
}
