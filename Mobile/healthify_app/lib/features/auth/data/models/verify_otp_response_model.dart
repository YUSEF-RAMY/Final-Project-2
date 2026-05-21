/// Response model for POST /verify-otp.
///
/// ```json
/// { "status": "success", "status_code": 200,
///   "message": "OTP verified...", "token": "1cf9ba0..." }
/// ```
class VerifyOtpResponseModel {
  final String status;
  final int statusCode;
  final String message;
  final String? token; // reset token to use in /reset-password

  const VerifyOtpResponseModel({
    required this.status,
    required this.statusCode,
    required this.message,
    this.token,
  });

  factory VerifyOtpResponseModel.fromJson(Map<String, dynamic> json) =>
      VerifyOtpResponseModel(
        status: json['status'] as String? ?? '',
        statusCode: json['status_code'] as int? ?? 0,
        message: json['message'] as String? ?? '',
        token: json['token'] as String?,
      );
}
