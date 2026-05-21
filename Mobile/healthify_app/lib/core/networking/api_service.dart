import 'package:dio/dio.dart';
import 'package:healthify_app/core/constants/api_constants.dart';

/// Thin wrapper around Dio exposing typed HTTP verbs.
/// Interceptors are set up in [DioFactory].
class ApiService {
  final Dio _dio;

  ApiService(this._dio);

  Future<Response<dynamic>> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) =>
      _dio.get(path,
          queryParameters: queryParameters, options: options);

  Future<Response<dynamic>> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) =>
      _dio.post(path,
          data: data, queryParameters: queryParameters, options: options);

  Future<Response<dynamic>> put(
    String path, {
    dynamic data,
    Options? options,
  }) =>
      _dio.put(path, data: data, options: options);

  Future<Response<dynamic>> patch(
    String path, {
    dynamic data,
    Options? options,
  }) =>
      _dio.patch(path, data: data, options: options);

  Future<Response<dynamic>> delete(
    String path, {
    dynamic data,
    Options? options,
  }) =>
      _dio.delete(path, data: data, options: options);
}
