import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class AuthDividerText extends StatelessWidget {
  final String text;

  const AuthDividerText({
    super.key,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Container(
            height: 1.h,
            color: const Color(0xFFE7E9E1),
          ),
        ),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 14.w),
          child: Text(
            text,
            style: TextStyle(
              fontSize: 14.sp,
              letterSpacing: 1.0,
              color: const Color(0xFFA8AEA3),
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Expanded(
          child: Container(
            height: 1.h,
            color: const Color(0xFFE7E9E1),
          ),
        ),
      ],
    );
  }
}