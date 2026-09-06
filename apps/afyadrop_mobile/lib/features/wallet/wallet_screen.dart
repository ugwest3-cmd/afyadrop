import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/api.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key, required this.api});
  final AfyaDropApi api;

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  Map<String, dynamic>? profile;
  bool loading = true;
  String? error;

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
      appBar: AppBar(title: const Text('Wallet')),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        children: [
                          Text('Current balance', style: Theme.of(context).textTheme.titleMedium),
                          const SizedBox(height: 8),
                          Text('$balance credits', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold, color: const Color(0xff00282c))),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text('Buy credits', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 8),
                  const Text('Minimum purchase is 1,000 UGX.'),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: [
                      _CreditChip(credits: 10, onTap: () => purchase(10)),
                      _CreditChip(credits: 25, onTap: () => purchase(25)),
                      _CreditChip(credits: 50, onTap: () => purchase(50)),
                      _CreditChip(credits: 100, onTap: () => purchase(100)),
                    ],
                  ),
                  if (error != null) ...[
                    const SizedBox(height: 16),
                    Text(error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                  ],
                ],
              ),
            ),
    );
  }
}

class _CreditChip extends StatelessWidget {
  const _CreditChip({required this.credits, required this.onTap});
  final int credits;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ActionChip(
      label: Text('$credits credits'),
      onPressed: onTap,
      backgroundColor: const Color(0xffd3ecb2),
    );
  }
}
