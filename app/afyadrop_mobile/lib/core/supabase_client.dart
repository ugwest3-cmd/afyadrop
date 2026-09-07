import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseClientInit {
  static Future<void> initialize() async {
    final supabaseUrl = const String.fromEnvironment('SUPABASE_URL', defaultValue: '');
    final supabaseAnonKey = const String.fromEnvironment('SUPABASE_ANON_KEY', defaultValue: '');

    await Supabase.initialize(
      url: supabaseUrl.isEmpty ? (dotenv.env['SUPABASE_URL'] ?? '') : supabaseUrl,
      publishableKey: supabaseAnonKey.isEmpty ? (dotenv.env['SUPABASE_ANON_KEY'] ?? '') : supabaseAnonKey,
      authOptions: const FlutterAuthClientOptions(
        persistSession: true,
        autoRefreshToken: true,
      ),
    );
  }
}
