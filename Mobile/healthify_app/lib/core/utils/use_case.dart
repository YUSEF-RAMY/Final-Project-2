import 'package:dartz/dartz.dart';
import 'package:healthify_app/core/error/failures.dart';

/// Base class for all use cases.
/// [Type] is the success return type, [Params] is the parameter type.
abstract class UseCase<Type, Params> {
  Future<Either<Failure, Type>> call(Params params);
}

/// Use this when the use case needs no parameters.
class NoParams {}
