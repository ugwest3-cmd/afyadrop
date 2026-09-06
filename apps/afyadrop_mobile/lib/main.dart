import 'package:flutter/material.dart';
import 'core/supabase_client.dart';
import 'features/splash/splash_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SupabaseClientInit.initialize();
  runApp(const AfyaDropApp());
}

class AfyaDropApp extends StatelessWidget {
  const AfyaDropApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AfyaDrop',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xff00282c),
          primary: const Color(0xff00282c),
          secondary: const Color(0xffd3ecb2),
          surface: const Color(0xfffff9ec),
        ),
        useMaterial3: true,
        inputDecorationTheme: const InputDecorationTheme(
          border: OutlineInputBorder(),
        ),
      ),
      home: const SplashScreen(),
    );
  }
}
