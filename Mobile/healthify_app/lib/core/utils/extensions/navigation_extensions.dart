import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:healthify_app/core/routing/route_names.dart';

/// Clean, type-safe navigation helpers available on any [BuildContext].
extension NavigationExtensions on BuildContext {
  // ── Generic push helpers ──────────────────────────────────────────

  Future<void> pushNamed(String routeName, {Object? arguments}) =>
      Navigator.pushNamed(this, routeName, arguments: arguments);

  Future<void> pushReplacementNamed(String routeName, {Object? arguments}) =>
      Navigator.pushReplacementNamed(this, routeName, arguments: arguments);

  Future<void> pushNamedAndRemoveUntil(String routeName,
          {Object? arguments}) =>
      Navigator.pushNamedAndRemoveUntil(
        this,
        routeName,
        (route) => false,
        arguments: arguments,
      );

  void pop<T>([T? result]) => Navigator.pop<T>(this, result);

  // ── Semantic navigation methods ───────────────────────────────────

  Future<void> navigateToSignIn() =>
      pushReplacementNamed(RouteNames.signIn);

  Future<void> navigateToSignUp() => pushNamed(RouteNames.signUp);

  Future<void> navigateToHome() =>
      pushNamedAndRemoveUntil(RouteNames.home);

  Future<void> navigateToForgotPassword() =>
      pushNamed(RouteNames.forgotPassword);

  Future<void> navigateToOtpVerification(String email) =>
      pushNamed(RouteNames.otpVerification, arguments: email);
}
