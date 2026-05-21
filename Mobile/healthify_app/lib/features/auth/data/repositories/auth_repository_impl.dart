import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:healthify_app/core/error/exceptions.dart';
import 'package:healthify_app/core/error/failures.dart';
import 'package:healthify_app/features/auth/data/datasources/auth_remote_data_source.dart';
import 'package:healthify_app/features/auth/domain/entities/user_entity.dart';
import 'package:healthify_app/features/auth/domain/repositories/auth_repository.dart';
import 'package:healthify_app/core/services/storage_service.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remote;
  final StorageService _storage;

  AuthRepositoryImpl(this._remote, this._storage);

  // ── Login ─────────────────────────────────────────────────────────

  @override
  Future<Either<Failure, UserEntity>> login({
    required String email,
    required String password,
  }) async {
    return _safeCall(() async {
      final res = await _remote.login(email: email, password: password);
      await _storage.saveAccessToken(res.data.token);
      return res.data.user.toEntity();
    });
  }

  // ── Register ──────────────────────────────────────────────────────

  @override
  Future<Either<Failure, UserEntity>> register({
    required String name,
    required String email,
    required String password,
    required String passwordConfirmation,
    String? profileImagePath,
  }) async {
    return _safeCall(() async {
      final res = await _remote.register(
        name: name,
        email: email,
        password: password,
        passwordConfirmation: passwordConfirmation,
        profileImagePath: profileImagePath,
      );
      await _storage.saveAccessToken(res.data.token);
      return res.data.user.toEntity();
    });
  }

  // ── Forgot Password ───────────────────────────────────────────────

  @override
  Future<Either<Failure, String>> forgotPassword({
    required String email,
  }) async {
    return _safeCall(() async {
      final res = await _remote.forgotPassword(email: email);
      return res.message;
    });
  }

  // ── Verify OTP ────────────────────────────────────────────────────

  @override
  Future<Either<Failure, String>> verifyOtp({
    required String email,
    required int code,
  }) async {
    return _safeCall(() async {
      final res = await _remote.verifyOtp(email: email, code: code);
      // Save the reset token returned by verify-otp
      if (res.token != null) await _storage.saveAccessToken(res.token!);
      return res.token ?? '';
    });
  }

  // ── Reset Password ────────────────────────────────────────────────

  @override
  Future<Either<Failure, String>> resetPassword({
    required String email,
    required String token,
    required String password,
    required String passwordConfirmation,
  }) async {
    return _safeCall(() async {
      final res = await _remote.resetPassword(
        email: email,
        token: token,
        password: password,
        passwordConfirmation: passwordConfirmation,
      );
      return res.message;
    });
  }

  // ── Logout ────────────────────────────────────────────────────────

  @override
  Future<Either<Failure, void>> logout() async {
    return _safeCall(() => _storage.clearTokens());
  }

  // ── Helper ────────────────────────────────────────────────────────

  Future<Either<Failure, T>> _safeCall<T>(Future<T> Function() body) async {
    try {
      return Right(await body());
    } on UnauthorisedException catch (e) {
      return Left(UnauthorisedFailure(message: e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message, statusCode: e.statusCode));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(message: e.message));
    } on DioException catch (e) {
      return Left(ServerFailure(
        message: e.message ?? 'Network error',
        statusCode: e.response?.statusCode,
      ));
    } catch (e) {
      return Left(UnknownFailure(message: e.toString()));
    }
  }
}
