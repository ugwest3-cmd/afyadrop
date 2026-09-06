import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/api.dart';
import '../auth/login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key, required this.api});
  final AfyaDropApi api;

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
      final result = await widget.api.me();
      if (mounted) setState(() => profile = Map<String, dynamic>.from(result['user'] ?? {}));
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
      MaterialPageRoute(builder: (_) => LoginScreen(api: widget.api)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile'), actions: [TextButton.icon(onPressed: logout, icon: const Icon(Icons.logout), label: const Text('Logout'))]),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Name', style: Theme.of(context).textTheme.titleSmall),
                          Text(profile?['full_name']?.toString() ?? ''),
                          const SizedBox(height: 12),
                          Text('Email', style: Theme.of(context).textTheme.titleSmall),
                          Text(profile?['email']?.toString() ?? ''),
                          const SizedBox(height: 12),
                          Text('Country', style: Theme.of(context).textTheme.titleSmall),
                          Text(profile?['country']?.toString() ?? ''),
                          const SizedBox(height: 12),
                          Text('Qualification', style: Theme.of(context).textTheme.titleSmall),
                          Text(profile?['qualification']?.toString() ?? ''),
                          const SizedBox(height: 12),
                          Text('Licence number', style: Theme.of(context).textTheme.titleSmall),
                          Text(profile?['licence_number']?.toString() ?? ''),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
