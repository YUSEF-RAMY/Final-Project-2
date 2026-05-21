// GENERATED CODE - DO NOT MODIFY BY HAND
// Run: flutter pub run build_runner build --delete-conflicting-outputs

part of 'user_model.dart';

UserModel _$UserModelFromJson(Map<String, dynamic> json) => UserModel(
      name: json['name'] as String,
      email: json['email'] as String,
      profileImage: json['profile_image'] as String?,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String?,
    );

Map<String, dynamic> _$UserModelToJson(UserModel instance) =>
    <String, dynamic>{
      'name': instance.name,
      'email': instance.email,
      'profile_image': instance.profileImage,
      'created_at': instance.createdAt,
      'updated_at': instance.updatedAt,
    };
