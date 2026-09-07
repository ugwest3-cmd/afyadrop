import 'package:flutter/material.dart';
import '../design_system.dart';

class AfyaDisclaimer extends StatelessWidget {
  const AfyaDisclaimer({
    super.key,
    this.title = 'Clinical Decision Support',
    this.message =
        'This tool provides decision support information only. Always verify with current guidelines and clinical judgment.',
    this.icon = Icons.info_outline_rounded,
    this.backgroundColor,
    this.foregroundColor,
    this.padding,
  });

  final String title;
  final String message;
  final IconData icon;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final EdgeInsetsGeometry? padding;

  @override
  Widget build(BuildContext context) {
    final bg = backgroundColor ?? AfyaColors.secondary.withOpacity(0.08);
    final fg = foregroundColor ?? AfyaColors.secondary;

    return Container(
      padding: padding ?? const EdgeInsets.all(AfyaSpacing.md),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(AfyaRadius.md),
        border: Border.all(color: fg.withOpacity(0.2)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: fg, size: 20),
          const SizedBox(width: AfyaSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontFamily: AfyaTextStyles.headlineFont,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: fg,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  message,
                  style: TextStyle(
                    fontFamily: AfyaTextStyles.bodyFont,
                    fontSize: 12,
                    color: fg.withOpacity(0.9),
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
