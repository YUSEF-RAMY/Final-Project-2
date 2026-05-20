import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class AuthSocialButton extends StatelessWidget {
  final String label;
  final String iconText;
  final Color iconColor;

  const AuthSocialButton({
    super.key,
    required this.label,
    required this.iconText,
    required this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 50.h,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(25.r),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            iconText,
            style: TextStyle(
              fontSize: label == 'Google' ? 22.sp : 20.sp,
              fontWeight: FontWeight.w700,
              color: iconColor,
            ),
          ),
          SizedBox(width: 10.w),
          Text(
            label,
            style: TextStyle(
              fontSize: 16.sp,
              fontWeight: FontWeight.w500,
              color: const Color(0xFF252B28),
            ),
          ),
        ],
      ),
    );
  }
}