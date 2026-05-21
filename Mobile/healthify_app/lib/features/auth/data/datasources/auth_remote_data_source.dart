import 'package:dio/dio.dart';
import 'package:healthify_app/core/constants/api_constants.dart';
import 'package:healthify_app/core/error/exceptions.dart';
import 'package:healthify_app/core/error/error_model.dart';
import 'package:healthify_app/core/networking/api_service.dart';
import 'package:healthify_app/features/auth/data/models/auth_response_model.dart';
import 'package:healthify_app/features/auth/data/models/verify_otp_response_model.dart';
import 'package:healthify_app/features/auth/data/models/message_response_model.dart';

abstract class AuthRemoteDataSource {
  Future<AuthResponseModel> login({
    required String email,
    required String password,
  });

  Future<AuthResponseModel> register({
    required String name,
    required String email,
    required String password,
    required String passwordConfirmation,
    String? profileImagePath,
  });

  Future<MessageResponseModel> forgotPassword({required String email});

  Future<VerifyOtpResponseModel> verifyOtp({
    required String email,
    required int code,
  });

  Future<MessageResponseModel> resetPassword({
    required String email,
    required String token,
    required String password,
    required String passwordConfirmation,
  });
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final ApiService _api;

  AuthRemoteDataSourceImpl(this._api);

  @override
  Future<AuthResponseModel> login({
    required String email,
    required String password,
  }) async {
    final res = await _api.post(
      ApiConstants.login,
      data: FormData.fromMap({'email': email, 'password': password}),
    );
    return _parseAuth(res);
  }

  @override
  Future<AuthResponseModel> register({
    required String name,
    required String email,
    required String password,
    required String passwordConfirmation,
    String? profileImagePath,
  }) async {
    final map = <String, dynamic>{
      'name': name,
      'email': email,
      'password': password,
      'password_confirmation': passwordConfirmation,
    };

    if (profileImagePath != null) {
      map['profile_image'] = await MultipartFile.fromFile(profileImagePath);
    }

    final res = await _api.post(
      ApiConstants.register,
      data: FormData.fromMap(map),
    );
    return _parseAuth(res);
  }

  @override
  Future<MessageResponseModel> forgotPassword({required String email}) async {
    final res = await _api.post(
      ApiConstants.forgotPassword,
      data: FormData.fromMap({'email': email}),
    );
    return _parseMessage(res);
  }

  @override
  Future<VerifyOtpResponseModel> verifyOtp({
    required String email,
    required int code,
  }) async {
    final res = await _api.post(
      ApiConstants.verifyOtp,
      data: FormData.fromMap({'email': email, 'code': code}),
    );
    return _parseVerifyOtp(res);
  }

  @override
  Future<MessageResponseModel> resetPassword({
    required String email,
    required String token,
    required String password,
    required String passwordConfirmation,
  }) async {
    final res = await _api.post(
      ApiConstants.resetPassword,
      data: FormData.fromMap({
        'email': email,
        'token': token,
        'password': password,
        'password_confirmation': passwordConfirmation,
      }),
    );
    return _parseMessage(res);
  }

  // ── Parsers ───────────────────────────────────────────────────────

  AuthResponseModel _parseAuth(Response res) {
    _guardStatus(res);
    return AuthResponseModel.fromJson(res.data as Map<String, dynamic>);
  }

  MessageResponseModel _parseMessage(Response res) {
    _guardStatus(res);
    return MessageResponseModel.fromJson(res.data as Map<String, dynamic>);
  }

  VerifyOtpResponseModel _parseVerifyOtp(Response res) {
    _guardStatus(res);
    return VerifyOtpResponseModel.fromJson(res.data as Map<String, dynamic>);
  }

  void _guardStatus(Response res) {
    if (res.statusCode != null &&
        res.statusCode! >= 400) {
      final data = res.data;
      String message = 'Server error.';
      if (data is Map<String, dynamic>) {
        final model = ErrorModel.fromJson(data);
        message = model.readableErrors;
      }
      throw ServerException(message: message, statusCode: res.statusCode);
    }
  }
}
