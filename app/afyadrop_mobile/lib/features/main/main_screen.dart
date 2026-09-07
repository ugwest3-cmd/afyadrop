import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/api.dart';
import '../../core/design_system.dart';
import '../../core/widgets/afya_bottom_nav.dart';
import '../home/home_screen.dart';
import '../history/history_screen.dart';
import '../wallet/wallet_screen.dart';
import '../guidelines/guidelines_screen.dart';
import '../lab_scan/lab_scan_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key, required this.api});
  final AfyaDropApi api;

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      HomeScreen(api: widget.api, showAppBar: false),
      const GuidelinesScreen(),
      HistoryScreen(api: widget.api, showAppBar: false),
      WalletScreen(api: widget.api, showAppBar: false),
      const LabScanScreen(),
    ];
  }

  void _onTap(int index) {
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _screens),
      bottomNavigationBar: AfyaBottomNav(
        currentIndex: _currentIndex,
        onTap: _onTap,
      ),
    );
  }
}
