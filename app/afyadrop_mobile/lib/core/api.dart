import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AfyaDropApi {
  AfyaDropApi()
      : _dio = Dio(BaseOptions(
          baseUrl: const String.fromEnvironment(
            'API_BASE_URL',
            defaultValue: 'http://10.0.2.2:4000',
          ),
          headers: {'content-type': 'application/json'},
        )) {
    final envBaseUrl = dotenv.env['API_BASE_URL'];
    if (envBaseUrl != null && envBaseUrl.isNotEmpty) {
      _dio.options.baseUrl = envBaseUrl;
    }
  }

  final Dio _dio;

  Future<String?> getBearerToken() async {
    final session = Supabase.instance.client.auth.currentSession;
    return session?.accessToken;
  }

  Future<Options> _authOptions() async {
    final token = await getBearerToken();
    return Options(headers: token != null ? {'Authorization': 'Bearer $token'} : {});
  }

  Future<Map<String, dynamic>> me() async {
    final res = await _dio.get('/auth/me', options: await _authOptions());
    return Map<String, dynamic>.from(res.data);
  }

  Future<Map<String, dynamic>> completeProfile(Map<String, dynamic> input) async {
    final res = await _dio.patch('/auth/profile', data: input, options: await _authOptions());
    return Map<String, dynamic>.from(res.data);
  }

  Future<Map<String, dynamic>> countries() async {
    final res = await _dio.get('/auth/countries');
    return Map<String, dynamic>.from(res.data);
  }

  Future<Map<String, dynamic>> balance(String userId) async {
    final res = await _dio.get('/credits/balance/$userId', options: await _authOptions());
    return Map<String, dynamic>.from(res.data);
  }

  Future<Map<String, dynamic>> purchase(String userId, int credits) async {
    final res = await _dio.post('/credits/purchase', data: {'user_id': userId, 'credits': credits}, options: await _authOptions());
    return Map<String, dynamic>.from(res.data);
  }

  Future<Map<String, dynamic>> ask(String question, {String? imageUrl}) async {
    final res = await _dio.post('/qa/ask', data: {
      'question': question,
      if (imageUrl != null) 'image_url': imageUrl,
    }, options: await _authOptions());
    return Map<String, dynamic>.from(res.data);
  }

  Future<List<Map<String, dynamic>>> history() async {
    final res = await _dio.get('/qa/history', options: await _authOptions());
    final data = Map<String, dynamic>.from(res.data);
    return List<Map<String, dynamic>>.from(data['items'] as List);
  }

  Future<Map<String, dynamic>> documents() async {
    final res = await _dio.get('/documents', options: await _authOptions());
    return Map<String, dynamic>.from(res.data);
  }

  Future<Map<String, dynamic>> adminStats(String secret) async {
    final res = await _dio.get('/admin/stats', options: Options(headers: {'x-admin-secret': secret}));
    return Map<String, dynamic>.from(res.data);
  }

  Future<String?> errorMessage(Object error) async {
    if (error is DioException && error.response?.data is Map) {
      return error.response?.data['error']?.toString();
    }
    return null;
  }
}
