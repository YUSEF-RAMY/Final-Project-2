/// Generic response for endpoints that only return status + message.
/// Used by: forgot-password, reset-password, change-password.
class MessageResponseModel {
  final String status;
  final int statusCode;
  final String message;

  const MessageResponseModel({
    required this.status,
    required this.statusCode,
    required this.message,
  });

  factory MessageResponseModel.fromJson(Map<String, dynamic> json) =>
      MessageResponseModel(
        status: json['status'] as String? ?? '',
        statusCode: json['status_code'] as int? ?? 0,
        message: json['message'] as String? ?? '',
      );
}
