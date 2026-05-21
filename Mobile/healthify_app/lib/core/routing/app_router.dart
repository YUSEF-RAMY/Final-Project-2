import 'package:flutter/material.dart';
import 'package:healthify_app/core/routing/route_names.dart';
import 'package:healthify_app/features/auth/presentation/views/forgot_password_view.dart';
import 'package:healthify_app/features/auth/presentation/views/otp_verification_view.dart';
import 'package:healthify_app/features/auth/presentation/views/signin_view.dart';
import 'package:healthify_app/features/auth/presentation/views/singup_view.dart';
import 'package:healthify_app/features/home/presentation/views/home_view.dart';
import 'package:healthify_app/features/splash/presentation/views/splash_view.dart';

/// Centralised route generator.
/// Register via `onGenerateRoute: AppRouter.generateRoute` in [MaterialApp].
class AppRouter {
  AppRouter._();

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case RouteNames.splash:
        return _fade(const SplashView());

      case RouteNames.signIn:
        return _slide(const SignInView());

      case RouteNames.signUp:
        return _slide(const SignUpView());

      case RouteNames.forgotPassword:
        return _slide(const ForgotPasswordView());

      case RouteNames.otpVerification:
        final email = settings.arguments as String? ?? '';
        return _slide(OtpVerificationView(email: email));

      case RouteNames.home:
        return _slide(const HomeView());

      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(
              child: Text('No route defined for "${settings.name}"'),
            ),
          ),
        );
    }
  }

  // ── Transition helpers ────────────────────────────────────────────

  static PageRouteBuilder<T> _fade<T>(Widget page) {
    return PageRouteBuilder<T>(
      pageBuilder: (_, __, ___) => page,
      transitionDuration: const Duration(milliseconds: 350),
      transitionsBuilder: (_, animation, __, child) =>
          FadeTransition(opacity: animation, child: child),
    );
  }

  static PageRouteBuilder<T> _slide<T>(Widget page) {
    return PageRouteBuilder<T>(
      pageBuilder: (_, __, ___) => page,
      transitionDuration: const Duration(milliseconds: 300),
      transitionsBuilder: (_, animation, __, child) {
        const begin = Offset(1.0, 0.0);
        const end = Offset.zero;
        final tween =
            Tween(begin: begin, end: end).chain(CurveTween(curve: Curves.ease));
        return SlideTransition(position: animation.drive(tween), child: child);
      },
    );
  }
}
