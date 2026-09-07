import 'package:flutter/material.dart';
import '../design_system.dart';

enum AfyaButtonType { primary, secondary, outline, text }

class AfyaButton extends StatelessWidget {
  const AfyaButton({
    super.key,
    required this.label,
    this.onPressed,
    this.icon,
    this.type = AfyaButtonType.primary,
    this.fullWidth = true,
    this.loading = false,
    this.disabled = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final Widget? icon;
  final AfyaButtonType type;
  final bool fullWidth;
  final bool loading;
  final bool disabled;

  @override
  Widget build(BuildContext context) {
    final isEnabled = onPressed != null && !disabled && !loading;
    final effectiveOnPressed = isEnabled ? onPressed : null;

    Widget child;
    if (loading) {
      child = const SizedBox(
        height: 20,
        width: 20,
        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
      );
    } else if (icon != null) {
      child = Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          icon!,
          const SizedBox(width: AfyaSpacing.sm),
          Text(label),
        ],
      );
    } else {
      child = Text(label);
    }

    switch (type) {
      case AfyaButtonType.primary:
        return SizedBox(
          width: fullWidth ? double.infinity : null,
          child: FilledButton(
            onPressed: effectiveOnPressed,
            style: FilledButton.styleFrom(
              backgroundColor: AfyaColors.primary,
              foregroundColor: AfyaColors.onPrimary,
              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AfyaRadius.md),
              ),
            ),
            child: child,
          ),
        );
      case AfyaButtonType.secondary:
        return SizedBox(
          width: fullWidth ? double.infinity : null,
          child: FilledButton(
            onPressed: effectiveOnPressed,
            style: FilledButton.styleFrom(
              backgroundColor: AfyaColors.secondary,
              foregroundColor: AfyaColors.onSecondary,
              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AfyaRadius.md),
              ),
            ),
            child: child,
          ),
        );
      case AfyaButtonType.outline:
        return SizedBox(
          width: fullWidth ? double.infinity : null,
          child: OutlinedButton(
            onPressed: effectiveOnPressed,
            style: OutlinedButton.styleFrom(
              foregroundColor: AfyaColors.primary,
              side: const BorderSide(color: AfyaColors.outline),
              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AfyaRadius.md),
              ),
            ),
            child: child,
          ),
        );
      case AfyaButtonType.text:
        return TextButton(
          onPressed: effectiveOnPressed,
          child: child,
        );
    }
  }
}
