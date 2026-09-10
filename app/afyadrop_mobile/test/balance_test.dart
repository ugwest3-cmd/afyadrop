import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:afyadrop_mobile/core/api.dart';
import 'package:afyadrop_mobile/core/supabase_client.dart';

void main() {
  test('fetch balance', () async {
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
    } else {
      print("No user logged in.");
    }
  });
}
