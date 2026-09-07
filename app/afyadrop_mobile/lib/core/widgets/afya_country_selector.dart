import 'package:flutter/material.dart';
import '../design_system.dart';

class AfyaCountrySelector extends StatelessWidget {
  const AfyaCountrySelector({
    super.key,
    required this.selectedCode,
    required this.onSelected,
    this.items = const [
      _CountryData(code: 'UG', name: 'Uganda'),
      _CountryData(code: 'KE', name: 'Kenya'),
      _CountryData(code: 'TZ', name: 'Tanzania'),
      _CountryData(code: 'RW', name: 'Rwanda'),
      _CountryData(code: 'ZM', name: 'Zambia'),
    ],
  });

  final String? selectedCode;
  final ValueChanged<String?> onSelected;
  final List<_CountryData> items;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: AfyaSpacing.sm,
      runSpacing: AfyaSpacing.sm,
      children: items.map((item) {
        final isSelected = selectedCode == item.code;
        final countryColor = AfyaColors.countryColor(item.code);
        return FilterChip(
          label: Text(item.name),
          selected: isSelected,
          onSelected: (value) => onSelected(value ? item.code : null),
          backgroundColor: AfyaColors.surfaceVariant,
          side: BorderSide(
            color: isSelected ? countryColor : AfyaColors.outline,
            width: isSelected ? 0 : 1,
          ),
          checkmarkColor: Colors.white,
          selectedColor: countryColor,
          labelStyle: TextStyle(
            fontFamily: AfyaTextStyles.bodyFont,
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: isSelected ? Colors.white : AfyaColors.onSurface,
          ),
        );
      }).toList(),
    );
  }
}

class _CountryData {
  const _CountryData({required this.code, required this.name});

  final String code;
  final String name;
}
