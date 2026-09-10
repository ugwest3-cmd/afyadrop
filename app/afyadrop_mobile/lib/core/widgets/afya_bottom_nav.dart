import 'package:flutter/material.dart';
import '../design_system.dart';

class AfyaBottomNav extends StatelessWidget {
  const AfyaBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
    this.items = const [
      _BottomNavItemData(icon: Icons.medical_services_outlined, activeIcon: Icons.medical_services, label: 'Consult'),
      _BottomNavItemData(icon: Icons.document_scanner_outlined, activeIcon: Icons.document_scanner, label: 'Scan'),
      _BottomNavItemData(icon: Icons.person_outline, activeIcon: Icons.person, label: 'Profile'),
    ],
  });

  final int currentIndex;
  final ValueChanged<int> onTap;
  final List<_BottomNavItemData> items;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return BottomNavigationBar(
      currentIndex: currentIndex,
      onTap: onTap,
      backgroundColor: theme.bottomNavigationBarTheme.backgroundColor,
      selectedItemColor: theme.bottomNavigationBarTheme.selectedItemColor,
      unselectedItemColor: theme.bottomNavigationBarTheme.unselectedItemColor,
      type: BottomNavigationBarType.fixed,
      elevation: 0,
      items: items
          .map(
            (item) => BottomNavigationBarItem(
              icon: Icon(item.icon),
              activeIcon: Icon(item.activeIcon),
              label: item.label,
            ),
          )
          .toList(),
    );
  }
}

class _BottomNavItemData {
  const _BottomNavItemData({
    required this.icon,
    required this.activeIcon,
    required this.label,
  });

  final IconData icon;
  final IconData activeIcon;
  final String label;
}
