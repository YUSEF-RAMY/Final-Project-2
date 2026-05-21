import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class ForgotPasswordHeader extends StatelessWidget {
  const ForgotPasswordHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Forgot Password?',
          style: TextStyle(
            fontSize: 30.sp,
            fontWeight: FontWeight.w700,
            color: const Color(0xFF202428),
          ),
        ),
        SizedBox(height: 14.h),
        Text(
          'Enter the email associated with your\n'
          'Healthyfy account to receive a 4-digit\n'
          'verification code.',
          style: TextStyle(
            fontSize: 16.sp,
            height: 1.55,
            fontWeight: FontWeight.w400,
            color: const Color(0xFF525C58),
          ),
        ),
      ],
    );
  }
}
