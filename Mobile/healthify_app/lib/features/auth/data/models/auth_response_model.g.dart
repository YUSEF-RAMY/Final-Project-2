// GENERATED CODE - DO NOT MODIFY BY HAND
// Run: flutter pub run build_runner build --delete-conflicting-outputs

part of 'auth_response_model.dart';

AuthResponseModel _$AuthResponseModelFromJson(Map<String, dynamic> json) =>
    AuthResponseModel(
      status: json['status'] as String,
      statusCode: json['status_code'] as int,
      message: json['message'] as String,
      data: AuthDataModel.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$AuthResponseModelToJson(AuthResponseModel instance) =>
    <String, dynamic>{
      'status': instance.status,
      'status_code': instance.statusCode,
      'message': instance.message,
      'data': instance.data.toJson(),
    };

AuthDataModel _$AuthDataModelFromJson(Map<String, dynamic> json) =>
    AuthDataModel(
      user: UserModel.fromJson(json['user'] as Map<String, dynamic>),
      token: json['token'] as String,
      tokenType: json['token_type'] as String,
    );

Map<String, dynamic> _$AuthDataModelToJson(AuthDataModel instance) =>
    <String, dynamic>{
      'user': instance.user.toJson(),
      'token': instance.token,
      'token_type': instance.tokenType,
    };
