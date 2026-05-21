import 'package:equatable/equatable.dart';
import 'package:healthify_app/features/auth/data/models/user_model.dart';

/// Pure domain entity — no framework or serialisation dependencies.
class UserEntity extends Equatable {
  final String name;
  final String email;
  final String? profileImage;
  final String createdAt;

  const UserEntity({
    required this.name,
    required this.email,
    this.profileImage,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [name, email, profileImage, createdAt];
}

/// Extension to map data model → entity at the repository boundary.
extension UserModelMapper on UserModel {
  UserEntity toEntity() => UserEntity(
        name: name,
        email: email,
        profileImage: profileImage,
        createdAt: createdAt,
      );
}
