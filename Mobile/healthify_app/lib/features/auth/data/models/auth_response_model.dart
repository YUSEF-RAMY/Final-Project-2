import 'package:json_annotation/json_annotation.dart';
import 'user_model.dart';

part 'auth_response_model.g.dart';

/// Generic auth response envelope used by /login and /register.
///
/// ```json
/// { "status": "success", "status_code": 200, "message": "...",
///   "data": { "user": {...}, "token": "...", "token_type": "Bearer" } }
/// ```
@JsonSerializable()
class AuthResponseModel {
  @JsonKey(name: 'status')
  final String status;

  @JsonKey(name: 'status_code')
  final int statusCode;

  @JsonKey(name: 'message')
  final String message;

  @JsonKey(name: 'data')
  final AuthDataModel data;

  const AuthResponseModel({
    required this.status,
    required this.statusCode,
    required this.message,
    required this.data,
  });

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) =>
      _$AuthResponseModelFromJson(json);

  Map<String, dynamic> toJson() => _$AuthResponseModelToJson(this);
}

@JsonSerializable()
class AuthDataModel {
  @JsonKey(name: 'user')
  final UserModel user;

  @JsonKey(name: 'token')
  final String token;

  @JsonKey(name: 'token_type')
  final String tokenType;

  const AuthDataModel({
    required this.user,
    required this.token,
    required this.tokenType,
  });

  factory AuthDataModel.fromJson(Map<String, dynamic> json) =>
      _$AuthDataModelFromJson(json);

  Map<String, dynamic> toJson() => _$AuthDataModelToJson(this);
}
