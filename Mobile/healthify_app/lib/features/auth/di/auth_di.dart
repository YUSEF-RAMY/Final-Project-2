import 'package:healthify_app/core/di/service_locator.dart';
import 'package:healthify_app/core/networking/api_service.dart';
import 'package:healthify_app/core/services/storage_service.dart';
import 'package:healthify_app/features/auth/data/datasources/auth_remote_data_source.dart';
import 'package:healthify_app/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:healthify_app/features/auth/domain/repositories/auth_repository.dart';
import 'package:healthify_app/features/auth/domain/usecases/login_use_case.dart';
import 'package:healthify_app/features/auth/domain/usecases/register_use_case.dart';
import 'package:healthify_app/features/auth/domain/usecases/forgot_password_use_case.dart';
import 'package:healthify_app/features/auth/domain/usecases/verify_otp_use_case.dart';
import 'package:healthify_app/features/auth/presentation/cubit/auth_cubit.dart';

/// Register all auth-feature dependencies with the service locator.
/// Called from [setupServiceLocator] in service_locator.dart.
void setupAuthDi() {
  // Data source
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(sl<ApiService>()),
  );

  // Repository
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      sl<AuthRemoteDataSource>(),
      sl<StorageService>(),
    ),
  );

  // Use cases
  sl.registerLazySingleton(() => LoginUseCase(sl<AuthRepository>()));
  sl.registerLazySingleton(() => RegisterUseCase(sl<AuthRepository>()));
  sl.registerLazySingleton(() => ForgotPasswordUseCase(sl<AuthRepository>()));
  sl.registerLazySingleton(() => VerifyOtpUseCase(sl<AuthRepository>()));
  sl.registerLazySingleton(() => ResetPasswordUseCase(sl<AuthRepository>()));

  // Cubit — registered as factory so a fresh instance is created per screen
  sl.registerFactory(
    () => AuthCubit(
      loginUseCase: sl(),
      registerUseCase: sl(),
      forgotPasswordUseCase: sl(),
      verifyOtpUseCase: sl(),
      resetPasswordUseCase: sl(),
      repository: sl(),
    ),
  );
}
