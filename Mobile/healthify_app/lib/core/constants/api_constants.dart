class ApiConstants {
  ApiConstants._();

  /// Base URL — change here when the backend address changes.
  static const String baseUrl =
      'https://katydid-champion-mutually.ngrok-free.app/api/';

  // ── Timeouts (seconds) ───────────────────────────────────────────
  static const int connectTimeout = 15;
  static const int receiveTimeout = 15;
  static const int sendTimeout = 15;

  // ── Auth Endpoints ───────────────────────────────────────────────
  static const String login = 'login';
  static const String register = 'register';
  static const String forgotPassword = 'forgot-password';
  static const String verifyOtp = 'verify-otp';
  static const String resetPassword = 'reset-password';
  static const String changePassword = 'change-password';
}
