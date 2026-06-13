// lib/services/api_service.dart
// Single HTTP client for all FastAPI backend calls.
// Base URL is set in AppConstants.baseUrl.
// Endpoints mirrored from backend/routers/schemes.py and chat.py.

import 'package:dio/dio.dart';

import '../constants/app_constants.dart';
import '../models/scheme.dart';
import '../models/chat_message.dart';
import '../models/match_request.dart';
import '../models/user_profile.dart';

// ── Custom exception ──────────────────────────────────────────
class ApiException implements Exception {
  final String message;
  final int? statusCode;

  const ApiException(this.message, {this.statusCode});

  @override
  String toString() => 'ApiException($statusCode): $message';
}

// ── ApiService ────────────────────────────────────────────────
class ApiService {
  late final Dio _dio;

  ApiService({String? baseUrl}) {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl ?? AppConstants.baseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 30),
        sendTimeout:    const Duration(seconds: 10),
        headers: {
          'Content-Type': 'application/json',
          'Accept':       'application/json',
        },
      ),
    )
      ..interceptors.add(_LogInterceptor())
      ..interceptors.add(_ErrorInterceptor());
  }

  // ── GET /health ──────────────────────────────────────────────
  // Returns {status: 'ok', database: 'connected'|'error: ...'}
  Future<Map<String, dynamic>> healthCheck() async {
    final resp = await _get('/health');
    return resp.data as Map<String, dynamic>;
  }

  // ── POST /schemes/match ───────────────────────────────────────
  // Returns matched schemes for the given user profile + language.
  Future<List<MatchedScheme>> matchSchemes(MatchRequest request) async {
    final resp = await _post('/schemes/match', data: request.toJson());
    final body = resp.data as Map<String, dynamic>;
    final raw  = body['schemes'] as List<dynamic>;
    return raw.map((e) => MatchedScheme.fromJson(e as Map<String, dynamic>)).toList();
  }

  // ── GET /schemes/search?q=... ────────────────────────────────
  // Keyword search across scheme name and ministry fields.
  Future<List<MatchedScheme>> searchSchemes(String query) async {
    final resp = await _get('/schemes/search', queryParams: {'q': query});
    final body = resp.data as Map<String, dynamic>;
    final raw  = body['results'] as List<dynamic>;
    return raw.map((e) => MatchedScheme.fromJson(e as Map<String, dynamic>)).toList();
  }

  // ── GET /schemes/semantic-search?q=...&lang=... ───────────────
  // Vector embedding search; returns results with similarity scores.
  Future<List<MatchedScheme>> semanticSearch(String query, String lang) async {
    final resp = await _get(
      '/schemes/semantic-search',
      queryParams: {'q': query, 'lang': lang},
    );
    final body = resp.data as Map<String, dynamic>;
    final raw  = body['results'] as List<dynamic>;
    return raw.map((e) => MatchedScheme.fromJson(e as Map<String, dynamic>)).toList();
  }

  // ── GET /schemes/{scheme_id} ─────────────────────────────────
  // Full scheme detail record.
  Future<Scheme> getSchemeDetails(String schemeId) async {
    final resp = await _get('/schemes/$schemeId');
    return Scheme.fromJson(resp.data as Map<String, dynamic>);
  }

  // ── POST /schemes/check/{scheme_id} ──────────────────────────
  // Check eligibility of a single scheme for a user.
  Future<EligibilityCheckResult> checkEligibility(
    String schemeId,
    UserProfile user,
  ) async {
    final resp = await _post(
      '/schemes/check/$schemeId',
      data: user.toJson(),
    );
    return EligibilityCheckResult.fromJson(resp.data as Map<String, dynamic>);
  }

  // ── POST /chat ────────────────────────────────────────────────
  // RAG chatbot — returns reply + related scheme IDs.
  Future<ChatResponse> chat(ChatRequest request) async {
    final resp = await _post('/chat', data: request.toJson());
    return ChatResponse.fromJson(resp.data as Map<String, dynamic>);
  }

  // ── Private helpers ───────────────────────────────────────────

  Future<Response<dynamic>> _get(
    String path, {
    Map<String, dynamic>? queryParams,
  }) async {
    try {
      return await _dio.get(path, queryParameters: queryParams);
    } on DioException catch (e) {
      throw _mapDioError(e);
    }
  }

  Future<Response<dynamic>> _post(
    String path, {
    required Map<String, dynamic> data,
  }) async {
    try {
      return await _dio.post(path, data: data);
    } on DioException catch (e) {
      throw _mapDioError(e);
    }
  }

  ApiException _mapDioError(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const ApiException(
          'Connection timed out. Please check your internet connection.',
        );
      case DioExceptionType.connectionError:
        return const ApiException(
          'Could not connect to the server. Make sure the backend is running.',
        );
      case DioExceptionType.badResponse:
        final code    = e.response?.statusCode;
        final detail  = (e.response?.data as Map<String, dynamic>?)?['detail']
                        as String? ?? e.message ?? 'Unknown error';
        return ApiException(detail, statusCode: code);
      default:
        return ApiException(e.message ?? 'An unexpected error occurred.');
    }
  }
}

// ── Interceptors ──────────────────────────────────────────────

class _LogInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    // ignore: avoid_print
    print('[API] ${options.method} ${options.uri}');
    super.onRequest(options, handler);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // ignore: avoid_print
    print('[API] ERROR ${err.response?.statusCode}: ${err.message}');
    super.onError(err, handler);
  }
}

class _ErrorInterceptor extends Interceptor {
  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    // Treat non-2xx as errors even if Dio doesn't throw
    if (response.statusCode != null && response.statusCode! >= 400) {
      handler.reject(
        DioException(
          requestOptions: response.requestOptions,
          response: response,
          type: DioExceptionType.badResponse,
        ),
      );
      return;
    }
    super.onResponse(response, handler);
  }
}
