import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import 'package:healthify_app/core/error/failures.dart';
import 'package:healthify_app/core/utils/use_case.dart';
import 'package:healthify_app/features/auth/domain/entities/user_entity.dart';
import 'package:healthify_app/features/auth/domain/repositories/auth_repository.dart';

class LoginUseCase extends UseCase<UserEntity, LoginParams> {
  final AuthRepository _repository;
  LoginUseCase(this._repository);

  @override
  Future<Either<Failure, UserEntity>> call(LoginParams params) =>
      _repository.login(email: params.email, password: params.password);
}

class LoginParams extends Equatable {
  final String email;
  final String password;
  const LoginParams({required this.email, required this.password});

  @override
  List<Object> get props => [email, password];
}
