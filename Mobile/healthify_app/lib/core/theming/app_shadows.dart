import 'package:flutter/material.dart';

class AppShadows {
  static BoxShadow ambient = BoxShadow(
    color: AppColors.onSurface.withOpacity(.04),
    blurRadius: 40,
    offset: const Offset(0, 10),
  );
}