import 'package:flutter/material.dart';

class AfyaColors {
  AfyaColors._();

  static const primary = Color(0xFF00373c);
  static const primaryLight = Color(0xFF004d54);
  static const secondary = Color(0xFF006c49);
  static const secondaryLight = Color(0xFF008f60);
  static const surface = Color(0xFFf8f9ff);
  static const background = Color(0xFFf8f9ff);
  static const error = Color(0xFFba1a1a);
  static const onPrimary = Color(0xFFffffff);
  static const onSecondary = Color(0xFFffffff);
  static const onSurface = Color(0xFF1a1a1a);
  static const onBackground = Color(0xFF1a1a1a);
  static const onError = Color(0xFFffffff);
  static const outline = Color(0xFFe0e0e0);
  static const outlineVariant = Color(0xFFf0f0f0);
  static const surfaceVariant = Color(0xFFf0f2f5);
  static const shadow = Color(0x1a000000);

  static const chatBubbleUser = Color(0xFF14595E);
  static const chatBubbleUserText = Colors.white;
  static const chatBubbleAi = Color(0xFFFFFFFF);
  static const chatBubbleAiBorder = Color(0xFFE5E7EB);
  static const uganda = Color(0xFF991B1B);
  static const kenya = Color(0xFF854D0E);
  static const tanzania = Color(0xFF075985);
  static const rwanda = Color(0xFF15803D);
  static const zambia = Color(0xFFC2410C);

  static const countryColors = {
    'UG': uganda,
    'KE': kenya,
    'TZ': tanzania,
    'RW': rwanda,
    'ZM': zambia,
  };

  static Color countryColor(String code) =>
      countryColors[code.toUpperCase()] ?? primary;
}

class AfyaTextStyles {
  AfyaTextStyles._();

  static const String headlineFont = 'PlusJakartaSans';
  static const String bodyFont = 'Inter';

  static TextStyle get headlineLarge => TextStyle(
        fontFamily: headlineFont,
        fontSize: 32,
        fontWeight: FontWeight.w700,
        color: AfyaColors.onSurface,
        height: 1.25,
      );

  static TextStyle get headlineMedium => TextStyle(
        fontFamily: headlineFont,
        fontSize: 28,
        fontWeight: FontWeight.w700,
        color: AfyaColors.onSurface,
        height: 1.3,
      );

  static TextStyle get headlineSmall => TextStyle(
        fontFamily: headlineFont,
        fontSize: 24,
        fontWeight: FontWeight.w600,
        color: AfyaColors.onSurface,
        height: 1.3,
      );

  static TextStyle get titleLarge => TextStyle(
        fontFamily: headlineFont,
        fontSize: 22,
        fontWeight: FontWeight.w600,
        color: AfyaColors.onSurface,
        height: 1.4,
      );

  static TextStyle get titleMedium => TextStyle(
        fontFamily: headlineFont,
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: AfyaColors.onSurface,
        height: 1.4,
      );

  static TextStyle get titleSmall => TextStyle(
        fontFamily: headlineFont,
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: AfyaColors.onSurface,
        height: 1.4,
      );

  static TextStyle get bodyLarge => TextStyle(
        fontFamily: bodyFont,
        fontSize: 16,
        fontWeight: FontWeight.w400,
        color: AfyaColors.onSurface,
        height: 1.5,
      );

  static TextStyle get bodyMedium => TextStyle(
        fontFamily: bodyFont,
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: AfyaColors.onSurface,
        height: 1.5,
      );

  static TextStyle get bodySmall => TextStyle(
        fontFamily: bodyFont,
        fontSize: 12,
        fontWeight: FontWeight.w400,
        color: AfyaColors.onSurface,
        height: 1.4,
      );

  static TextStyle get labelLarge => TextStyle(
        fontFamily: bodyFont,
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: AfyaColors.onSurface,
        height: 1.4,
      );

  static TextStyle get labelMedium => TextStyle(
        fontFamily: bodyFont,
        fontSize: 12,
        fontWeight: FontWeight.w500,
        color: AfyaColors.onSurface,
        height: 1.4,
      );

  static TextStyle get labelSmall => TextStyle(
        fontFamily: bodyFont,
        fontSize: 10,
        fontWeight: FontWeight.w500,
        color: AfyaColors.onSurface,
        height: 1.4,
      );
}

class AfyaSpacing {
  AfyaSpacing._();

  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 16.0;
  static const lg = 24.0;
  static const xl = 32.0;
  static const xxl = 48.0;
}

class AfyaRadius {
  AfyaRadius._();

  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 12.0;
  static const lg = 16.0;
  static const xl = 24.0;
  static const full = 999.0;
}
