import 'package:flutter/material.dart';
import '../design_system.dart';

class AfyaChip extends StatelessWidget {
  const AfyaChip({
    super.key,
    required this.label,
    this.onSelected,
    this.selected = false,
    this.icon,
    this.backgroundColor,
    this.foregroundColor,
    this.borderColor,
    this.padding,
  });

  final String label;
  final ValueChanged<bool>? onSelected;
  final bool selected;
  final Widget? icon;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final Color? borderColor;
  final EdgeInsetsGeometry? padding;

  @override
  Widget build(BuildContext context) {
    final effectiveBg = backgroundColor ??
        (selected ? AfyaColors.primary : AfyaColors.surfaceVariant);
    final effectiveFg = foregroundColor ??
        (selected ? AfyaColors.onPrimary : AfyaColors.onSurface);
    final effectiveBorder = borderColor ??
        (selected ? AfyaColors.primary : AfyaColors.outline);

    return FilterChip(
      label: Text(label),
      selected: selected,
      onSelected: onSelected,
      backgroundColor: effectiveBg,
      side: BorderSide(color: effectiveBorder),
      checkmarkColor: effectiveFg,
      labelStyle: TextStyle(
        fontFamily: AfyaTextStyles.bodyFont,
        fontSize: 13,
        fontWeight: FontWeight.w500,
        color: effectiveFg,
      ),
      padding: padding ??
          const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      shape: StadiumBorder(
        side: BorderSide(color: effectiveBorder),
      ),
      showCheckmark: onSelected != null,
    );
  }
}
