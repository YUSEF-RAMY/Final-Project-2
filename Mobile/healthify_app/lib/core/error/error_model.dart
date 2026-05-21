/// A structured API error returned by the server on 4xx responses.
///
/// Example JSON:
/// ```json
/// { "status": "error", "status_code": 422,
///   "message": "Validation errors", "errors": {"email": ["Email is required"]} }
/// ```
class ErrorModel {
  final String status;
  final int statusCode;
  final String message;
  final Map<String, List<String>>? errors;

  const ErrorModel({
    required this.status,
    required this.statusCode,
    required this.message,
    this.errors,
  });

  factory ErrorModel.fromJson(Map<String, dynamic> json) {
    Map<String, List<String>>? parsedErrors;
    if (json['errors'] is Map) {
      final raw = json['errors'] as Map;
      parsedErrors = raw.map(
        (k, v) => MapEntry(
          k.toString(),
          (v as List).map((e) => e.toString()).toList(),
        ),
      );
    }
    return ErrorModel(
      status: json['status'] as String? ?? 'error',
      statusCode: json['status_code'] as int? ?? 0,
      message: json['message'] as String? ?? 'Unknown error.',
      errors: parsedErrors,
    );
  }

  /// Flattens all validation error messages into a single string.
  String get readableErrors {
    if (errors == null || errors!.isEmpty) return message;
    return errors!.entries
        .map((e) => e.value.join('\n'))
        .join('\n');
  }
}
