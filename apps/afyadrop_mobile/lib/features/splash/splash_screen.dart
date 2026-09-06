import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/api.dart';
import '../auth/login_screen.dart';
import '../auth/complete_profile_screen.dart';
import '../home/home_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _route();
  }

  Future<void> _route() async {
    final api = AfyaDropApi();
    final session = Supabase.instance.client.auth.currentSession;
    if (!mounted) return;

    if (session == null) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => LoginScreen(api: api)),
      );
      return;
    }

    try {
      final profileResult = await api.me();
      final user = Map<String, dynamic>.from(profileResult['user'] ?? {});
      final profileCompleted = user['profile_completed'] == true;

      if (!mounted) return;
      if (!profileCompleted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => CompleteProfileScreen(api: api)),
        );
      } else {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => HomeScreen(api: api)),
        );
      }
    } catch (e) {
      if (!mounted) return;
      await Supabase.instance.client.auth.signOut();
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => LoginScreen(api: api)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('AfyaDrop', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold, color: const Color(0xff00282c))),
            const SizedBox(height: 24),
            const CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}
