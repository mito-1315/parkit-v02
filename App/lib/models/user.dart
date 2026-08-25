import '../utils/json.dart';

class User {
  final int id;
  final String name;
  final String email;
  final String? phoneNumber;

  const User({
    required this.id,
    required this.name,
    required this.email,
    this.phoneNumber,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: jsonInt(json, ['user_id', 'id']),
      name: jsonStr(json, ['name']),
      email: jsonStr(json, ['email']),
      phoneNumber: jsonStrOrNull(json, ['phone_number']),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'phone_number': phoneNumber,
      };

  User copyWith({String? name, String? phoneNumber}) {
    return User(
      id: id,
      name: name ?? this.name,
      email: email,
      phoneNumber: phoneNumber ?? this.phoneNumber,
    );
  }
}
