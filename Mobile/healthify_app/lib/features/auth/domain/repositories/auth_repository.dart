import 'package:dartz/dartz.dart';
import 'package:healthify_app/core/error/failures.dart';
import 'package:healthify_app/features/auth/domain/entities/user_entity.dart';

/// Contract that the data layer must fulfil.
abstract class AuthRepository {
  Future<Either<Failure, UserEntity>> login({
    required String email,
    required String password,
  });

  Future<Either<Failure, UserEntity>> register({
    required String name,
    required String email,
    required String password,
    required String passwordConfirmation,
    String? profileImagePath,
  });

  Future<Either<Failure, String>> forgotPassword({required String email});

  Future<Either<Failure, String>> verifyOtp({
    required String email,
    required int code,
  });

  Future<Either<Failure, String>> resetPassword({
    required String email,
    required String token,
    required String password,
    required String passwordConfirmation,
  });

  Future<Either<Failure, void>> logout();
}
