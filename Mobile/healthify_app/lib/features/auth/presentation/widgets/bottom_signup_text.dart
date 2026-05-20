import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class BottomSignupText extends StatelessWidget {
  const BottomSignupText({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: 28.h),
      child: RichText(
        textAlign: TextAlign.center,
        text: TextSpan(
          text: "Don't have an account? ",
          style: TextStyle(
            fontSize: 18.sp,
            color: const Color(0xFF4C544F),
            fontWeight: FontWeight.w400,
          ),
          children: [
            TextSpan(
              text: 'Signup',
              style: TextStyle(
                fontSize: 18.sp,
                color: const Color(0xFF0B8F3E),
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}