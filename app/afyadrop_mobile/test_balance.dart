import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'lib/core/api.dart';
import 'lib/core/supabase_client.dart';

void main() async {
  await dotenv.load(fileName: ".env");
  await SupabaseClientInit.initialize();
  final api = AfyaDropApi();
  final user = Supabase.instance.client.auth.currentUser;
  print("User: ${user?.id} | ${user?.email}");
  if (user != null) {
    try {
      final bal = await api.balance(user.id);
      print("Balance response: $bal");
    } catch (e) {
      print("Error fetching balance: $e");
    }
  }
}
