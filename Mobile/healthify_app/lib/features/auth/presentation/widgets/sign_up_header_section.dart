import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class SignUpHeaderSection extends StatelessWidget {
  const SignUpHeaderSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          'Create Your\nSanctuary',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 34.sp,
            fontWeight: FontWeight.w700,
            color: const Color(0xFF212529),
            height: 1.15,
          ),
        ),
        SizedBox(height: 14.h),
        Text(
          'Start your precision nutrition journey\ntoday.',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 18.sp,
            fontWeight: FontWeight.w400,
            color: const Color(0xFF4D5A53),
            height: 1.5,
          ),
        ),
      ],
    );
  }
}