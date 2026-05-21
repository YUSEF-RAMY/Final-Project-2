import 'package:equatable/equatable.dart';
import 'package:healthify_app/features/auth/domain/entities/user_entity.dart';

abstract class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

/// Initial / idle state.
class AuthInitial extends AuthState {
  const AuthInitial();
}

/// Any API call in progress.
class AuthLoading extends AuthState {
  const AuthLoading();
}

/// Login or register succeeded — carries the authenticated user.
class AuthSuccess extends AuthState {
  final UserEntity user;
  const AuthSuccess(this.user);

  @override
  List<Object?> get props => [user];
}

/// Forgot-password OTP sent successfully.
class AuthOtpSent extends AuthState {
  final String message;
  const AuthOtpSent(this.message);

  @override
  List<Object?> get props => [message];
}

/// OTP verified — carries the reset token to pass to reset-password.
class AuthOtpVerified extends AuthState {
  final String resetToken;
  const AuthOtpVerified(this.resetToken);

  @override
  List<Object?> get props => [resetToken];
}

/// Password reset succeeded.
class AuthPasswordReset extends AuthState {
  final String message;
  const AuthPasswordReset(this.message);

  @override
  List<Object?> get props => [message];
}

/// Any failure — carries a user-friendly message.
class AuthError extends AuthState {
  final String message;
  const AuthError(this.message);

  @override
  List<Object?> get props => [message];
}

/// User logged out.
class AuthLoggedOut extends AuthState {
  const AuthLoggedOut();
}
