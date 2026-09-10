import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/api.dart';
import '../../core/design_system.dart';
import '../../core/widgets/afya_bottom_nav.dart';
import '../home/home_screen.dart';
import '../lab_scan/lab_scan_screen.dart';
import '../profile/profile_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key, required this.api});
  final AfyaDropApi api;

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;
  Map<String, dynamic>? profile;
  bool loading = true;

  late final List<Widget> _screens;

  int balance = 0;

  @override
  void initState() {
    super.initState();
    _screens = [
      HomeScreen(api: widget.api, showAppBar: false),
      const LabScanScreen(),
      ProfileScreen(api: widget.api),
    ];
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user != null) {
        final balRes = await widget.api.balance(user.id);
        if (mounted) setState(() => balance = (balRes['balance_credits'] as num?)?.toInt() ?? 0);
      }
      final result = await widget.api.me();
      if (mounted) setState(() => profile = Map<String, dynamic>.from(result['user'] ?? {}));
    } catch (e) {
      // Ignore
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  void _onTap(int index) {
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final countryCode = profile?['user_metadata']?['country']?.toString() ?? profile?['country']?.toString() ?? 'UG';

    return Scaffold(
      backgroundColor: AfyaColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        titleSpacing: 16,
        title: Row(
          children: [
            Image.asset('assets/images/afyadrop_logo.png', width: 28, height: 28),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('AfyaDrop', style: AfyaTextStyles.labelLarge.copyWith(fontWeight: FontWeight.w700, color: AfyaColors.primary)),
                Text('Uganda ${countryCode.toLowerCase()}', style: AfyaTextStyles.labelSmall.copyWith(color: AfyaColors.uganda, fontWeight: FontWeight.w600)),
              ],
            ),
          ],
        ),
        actions: [
          GestureDetector(
            onTap: () async {
              final url = Uri.parse('https://www.afyadrop.com/dashboard');
              await launchUrl(url, mode: LaunchMode.externalApplication);
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFE0F2FE),
                borderRadius: BorderRadius.circular(AfyaRadius.sm),
              ),
              child: Row(
                children: [
                  const Icon(Icons.account_balance_wallet_outlined, size: 14, color: Color(0xFF0284C7)),
                  const SizedBox(width: 4),
                  Text('$balance Left', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF0369A1))),
                  const SizedBox(width: 6),
                  Container(
                    decoration: const BoxDecoration(color: AfyaColors.primary, shape: BoxShape.circle),
                    padding: const EdgeInsets.all(2),
                    child: const Icon(Icons.add, size: 12, color: Colors.white),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),
          GestureDetector(
            onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => ProfileScreen(api: widget.api))),
            child: CircleAvatar(
              radius: 16,
              backgroundColor: AfyaColors.surfaceVariant,
              child: const Icon(Icons.person, size: 20, color: Colors.grey),
            ),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: IndexedStack(index: _currentIndex, children: _screens),
      bottomNavigationBar: AfyaBottomNav(
        currentIndex: _currentIndex,
        onTap: _onTap,
      ),
    );
  }
}
