import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:healthify_app/core/di/service_locator.dart';
import 'package:healthify_app/core/services/storage_service.dart';
import 'package:healthify_app/features/auth/domain/usecases/login_use_case.dart';
import 'package:healthify_app/features/auth/domain/usecases/register_use_case.dart';
import 'package:healthify_app/features/auth/domain/usecases/forgot_password_use_case.dart';
import 'package:healthify_app/features/auth/domain/usecases/verify_otp_use_case.dart';
import 'package:healthify_app/features/auth/domain/repositories/auth_repository.dart';
import 'auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  final LoginUseCase _loginUseCase;
  final RegisterUseCase _registerUseCase;
  final ForgotPasswordUseCase _forgotPasswordUseCase;
  final VerifyOtpUseCase _verifyOtpUseCase;
  final ResetPasswordUseCase _resetPasswordUseCase;
  final AuthRepository _repository;

  AuthCubit({
    required LoginUseCase loginUseCase,
    required RegisterUseCase registerUseCase,
    required ForgotPasswordUseCase forgotPasswordUseCase,
    required VerifyOtpUseCase verifyOtpUseCase,
    required ResetPasswordUseCase resetPasswordUseCase,
    required AuthRepository repository,
  })  : _loginUseCase = loginUseCase,
        _registerUseCase = registerUseCase,
        _forgotPasswordUseCase = forgotPasswordUseCase,
        _verifyOtpUseCase = verifyOtpUseCase,
        _resetPasswordUseCase = resetPasswordUseCase,
        _repository = repository,
        super(const AuthInitial());

  // ── Login ─────────────────────────────────────────────────────────

  Future<void> login(String email, String password) async {
    emit(const AuthLoading());
    final result = await _loginUseCase(
      LoginParams(email: email, password: password),
    );
    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (user) => emit(AuthSuccess(user)),
    );
  }

  // ── Register ──────────────────────────────────────────────────────

  Future<void> register({
    required String name,
    required String email,
    required String password,
    required String passwordConfirmation,
    String? profileImagePath,
  }) async {
    emit(const AuthLoading());
    final result = await _registerUseCase(
      RegisterParams(
        name: name,
        email: email,
        password: password,
        passwordConfirmation: passwordConfirmation,
        profileImagePath: profileImagePath,
      ),
    );
    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (user) => emit(AuthSuccess(user)),
    );
  }

  // ── Forgot Password ───────────────────────────────────────────────

  Future<void> forgotPassword(String email) async {
    emit(const AuthLoading());
    final result = await _forgotPasswordUseCase(
      ForgotPasswordParams(email: email),
    );
    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (message) => emit(AuthOtpSent(message)),
    );
  }

  // ── Verify OTP ────────────────────────────────────────────────────

  Future<void> verifyOtp(String email, int code) async {
    emit(const AuthLoading());
    final result = await _verifyOtpUseCase(
      VerifyOtpParams(email: email, code: code),
    );
    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (resetToken) => emit(AuthOtpVerified(resetToken)),
    );
  }

  // ── Reset Password ────────────────────────────────────────────────

  Future<void> resetPassword({
    required String email,
    required String token,
    required String password,
    required String passwordConfirmation,
  }) async {
    emit(const AuthLoading());
    final result = await _resetPasswordUseCase(
      ResetPasswordParams(
        email: email,
        token: token,
        password: password,
        passwordConfirmation: passwordConfirmation,
      ),
    );
    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (message) => emit(AuthPasswordReset(message)),
    );
  }

  // ── Logout ────────────────────────────────────────────────────────

  Future<void> logout() async {
    emit(const AuthLoading());
    // Clear stored token then signal logged-out state
    await sl<StorageService>().clearTokens();
    emit(const AuthLoggedOut());
  }

  // ── Reset to initial ─────────────────────────────────────────────

  void reset() => emit(const AuthInitial());
}
