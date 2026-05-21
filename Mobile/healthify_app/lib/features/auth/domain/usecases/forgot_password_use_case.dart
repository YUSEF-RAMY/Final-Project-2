import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import 'package:healthify_app/core/error/failures.dart';
import 'package:healthify_app/core/utils/use_case.dart';
import 'package:healthify_app/features/auth/domain/repositories/auth_repository.dart';

class ForgotPasswordUseCase extends UseCase<String, ForgotPasswordParams> {
  final AuthRepository _repository;
  ForgotPasswordUseCase(this._repository);

  @override
  Future<Either<Failure, String>> call(ForgotPasswordParams params) =>
      _repository.forgotPassword(email: params.email);
}

class ForgotPasswordParams extends Equatable {
  final String email;
  const ForgotPasswordParams({required this.email});

  @override
  List<Object> get props => [email];
}
