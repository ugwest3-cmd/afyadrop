import 'package:flutter/material.dart';
import '../design_system.dart';

class AfyaCard extends StatelessWidget {
  const AfyaCard({
    super.key,
    this.child,
    this.padding,
    this.margin,
    this.color,
    this.elevation,
    this.borderColor,
    this.borderWidth,
    this.shape,
    this.onTap,
  });

  final Widget? child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final Color? color;
  final double? elevation;
  final Color? borderColor;
  final double? borderWidth;
  final ShapeBorder? shape;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final card = Card(
      color: color ?? theme.cardTheme.color,
      elevation: elevation ?? theme.cardTheme.elevation,
      shape: shape ?? theme.cardTheme.shape,
      child: Padding(
        padding: padding ?? const EdgeInsets.all(AfyaSpacing.md),
        child: child,
      ),
    );

    if (onTap != null) {
      return InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: card,
      );
    }

    return card;
  }
}
