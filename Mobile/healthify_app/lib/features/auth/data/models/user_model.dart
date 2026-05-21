import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

/// Maps to the `user` object inside API responses.
/// All nullable fields appear only in register response.
@JsonSerializable()
class UserModel {
  @JsonKey(name: 'name')
  final String name;

  @JsonKey(name: 'email')
  final String email;

  @JsonKey(name: 'profile_image')
  final String? profileImage;

  @JsonKey(name: 'created_at')
  final String createdAt;

  @JsonKey(name: 'updated_at')
  final String? updatedAt;

  const UserModel({
    required this.name,
    required this.email,
    this.profileImage,
    required this.createdAt,
    this.updatedAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);

  Map<String, dynamic> toJson() => _$UserModelToJson(this);
}
