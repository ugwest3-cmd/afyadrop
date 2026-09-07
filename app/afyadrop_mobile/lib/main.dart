import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/supabase_client.dart';
import 'core/design_system.dart';
import 'features/splash/splash_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  await SupabaseClientInit.initialize();
  runApp(const AfyaDropApp());
}

class AfyaDropApp extends StatelessWidget {
  const AfyaDropApp({super.key});

  @override
  Widget build(BuildContext context) {
    final baseTheme = ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AfyaColors.primary,
        primary: AfyaColors.primary,
        secondary: AfyaColors.secondary,
        surface: AfyaColors.surface,
        background: AfyaColors.background,
        error: AfyaColors.error,
        onPrimary: AfyaColors.onPrimary,
        onSecondary: AfyaColors.onSecondary,
        onSurface: AfyaColors.onSurface,
        onBackground: AfyaColors.onBackground,
        onError: AfyaColors.onError,
        outline: AfyaColors.outline,
      ),
      scaffoldBackgroundColor: AfyaColors.background,
      fontFamily: AfyaTextStyles.bodyFont,
    );

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        systemNavigationBarColor: AfyaColors.surface,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
      child: MaterialApp(
        title: 'AfyaDrop',
        debugShowCheckedModeBanner: false,
        theme: baseTheme.copyWith(
          textTheme: GoogleFonts.interTextTheme(baseTheme.textTheme).copyWith(
            displayLarge: GoogleFonts.plusJakartaSansTextTheme(baseTheme.textTheme).displayLarge,
            displayMedium: GoogleFonts.plusJakartaSansTextTheme(baseTheme.textTheme).displayMedium,
            displaySmall: GoogleFonts.plusJakartaSansTextTheme(baseTheme.textTheme).displaySmall,
            headlineLarge: GoogleFonts.plusJakartaSansTextTheme(baseTheme.textTheme).headlineLarge,
            headlineMedium: GoogleFonts.plusJakartaSansTextTheme(baseTheme.textTheme).headlineMedium,
            headlineSmall: GoogleFonts.plusJakartaSansTextTheme(baseTheme.textTheme).headlineSmall,
            titleLarge: GoogleFonts.plusJakartaSansTextTheme(baseTheme.textTheme).titleLarge,
            titleMedium: GoogleFonts.plusJakartaSansTextTheme(baseTheme.textTheme).titleMedium,
            titleSmall: GoogleFonts.plusJakartaSansTextTheme(baseTheme.textTheme).titleSmall,
            bodyLarge: GoogleFonts.interTextTheme(baseTheme.textTheme).bodyLarge,
            bodyMedium: GoogleFonts.interTextTheme(baseTheme.textTheme).bodyMedium,
            bodySmall: GoogleFonts.interTextTheme(baseTheme.textTheme).bodySmall,
            labelLarge: GoogleFonts.interTextTheme(baseTheme.textTheme).labelLarge,
            labelMedium: GoogleFonts.interTextTheme(baseTheme.textTheme).labelMedium,
            labelSmall: GoogleFonts.interTextTheme(baseTheme.textTheme).labelSmall,
          ),
          inputDecorationTheme: InputDecorationTheme(
            filled: true,
            fillColor: const Color(0xFFF0F2F5),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide.none,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide.none,
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: AfyaColors.primary, width: 2),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: AfyaColors.error),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              backgroundColor: AfyaColors.primary,
              foregroundColor: AfyaColors.onPrimary,
              elevation: 0,
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
              textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, fontFamily: 'PlusJakartaSans'),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
          filledButtonTheme: FilledButtonThemeData(
            style: FilledButton.styleFrom(
              backgroundColor: AfyaColors.primary,
              foregroundColor: AfyaColors.onPrimary,
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
              textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, fontFamily: 'PlusJakartaSans'),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
          outlinedButtonTheme: OutlinedButtonThemeData(
            style: OutlinedButton.styleFrom(
              foregroundColor: AfyaColors.primary,
              side: const BorderSide(color: AfyaColors.outlineVariant, width: 1.5),
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
              textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, fontFamily: 'PlusJakartaSans'),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
          cardTheme: CardThemeData(
            color: AfyaColors.surface,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(24),
              side: const BorderSide(color: AfyaColors.outlineVariant, width: 1),
            ),
            margin: EdgeInsets.zero,
          ),
          appBarTheme: AppBarTheme(
            backgroundColor: AfyaColors.background,
            foregroundColor: AfyaColors.onSurface,
            elevation: 0,
            scrolledUnderElevation: 0,
            centerTitle: false,
            titleTextStyle: GoogleFonts.plusJakartaSans(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: AfyaColors.onSurface,
            ),
          ),
          bottomNavigationBarTheme: const BottomNavigationBarThemeData(
            backgroundColor: AfyaColors.surface,
            selectedItemColor: AfyaColors.primary,
            unselectedItemColor: Color(0xFF9E9E9E),
            type: BottomNavigationBarType.fixed,
            elevation: 0,
            selectedLabelStyle: TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
            unselectedLabelStyle: TextStyle(fontWeight: FontWeight.w500, fontSize: 12),
          ),
        ),
        home: const SplashScreen(),
      ),
    );
  }
}
