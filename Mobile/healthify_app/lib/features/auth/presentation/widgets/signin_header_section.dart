import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class SigninHeaderSection extends StatelessWidget {
  const SigninHeaderSection();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          'Welcome Back',
          style: TextStyle(
            fontSize: 34.sp,
            fontWeight: FontWeight.w700,
            color: const Color(0xFF212529),
          ),
        ),
        SizedBox(height: 12.h),
        Text(
          'Sign in to your Healthyfy sanctuary',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 18.sp,
            fontWeight: FontWeight.w400,
            color: const Color(0xFF4D5A53),
          ),
        ),
      ],
    );
  }
}
