import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import 'package:healthify_app/core/error/failures.dart';
import 'package:healthify_app/core/utils/use_case.dart';
import 'package:healthify_app/features/auth/domain/repositories/auth_repository.dart';

class VerifyOtpUseCase extends UseCase<String, VerifyOtpParams> {
  final AuthRepository _repository;
  VerifyOtpUseCase(this._repository);

  @override
  Future<Either<Failure, String>> call(VerifyOtpParams params) =>
      _repository.verifyOtp(email: params.email, code: params.code);
}

class VerifyOtpParams extends Equatable {
  final String email;
  final int code;
  const VerifyOtpParams({required this.email, required this.code});

  @override
  List<Object> get props => [email, code];
}

// ── Reset Password ─────────────────────────────────────────────────────────

class ResetPasswordUseCase extends UseCase<String, ResetPasswordParams> {
  final AuthRepository _repository;
  ResetPasswordUseCase(this._repository);

  @override
  Future<Either<Failure, String>> call(ResetPasswordParams params) =>
      _repository.resetPassword(
        email: params.email,
        token: params.token,
        password: params.password,
        passwordConfirmation: params.passwordConfirmation,
      );
}

class ResetPasswordParams extends Equatable {
  final String email;
  final String token;
  final String password;
  final String passwordConfirmation;

  const ResetPasswordParams({
    required this.email,
    required this.token,
    required this.password,
    required this.passwordConfirmation,
  });

  @override
  List<Object> get props => [email, token, password, passwordConfirmation];
}
