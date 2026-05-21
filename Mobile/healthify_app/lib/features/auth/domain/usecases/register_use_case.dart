import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import 'package:healthify_app/core/error/failures.dart';
import 'package:healthify_app/core/utils/use_case.dart';
import 'package:healthify_app/features/auth/domain/entities/user_entity.dart';
import 'package:healthify_app/features/auth/domain/repositories/auth_repository.dart';

class RegisterUseCase extends UseCase<UserEntity, RegisterParams> {
  final AuthRepository _repository;
  RegisterUseCase(this._repository);

  @override
  Future<Either<Failure, UserEntity>> call(RegisterParams params) =>
      _repository.register(
        name: params.name,
        email: params.email,
        password: params.password,
        passwordConfirmation: params.passwordConfirmation,
        profileImagePath: params.profileImagePath,
      );
}

class RegisterParams extends Equatable {
  final String name;
  final String email;
  final String password;
  final String passwordConfirmation;
  final String? profileImagePath;

  const RegisterParams({
    required this.name,
    required this.email,
    required this.password,
    required this.passwordConfirmation,
    this.profileImagePath,
  });

  @override
  List<Object?> get props =>
      [name, email, password, passwordConfirmation, profileImagePath];
}
