import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class SuccessMessageChip extends StatelessWidget {
  const SuccessMessageChip({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 10.h),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.92),
        borderRadius: BorderRadius.circular(16.r),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 18.r,
            offset: Offset(0, 8.h),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 20.w,
            height: 20.w,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: const Color(0xFF93D2A7),
                width: 1.5.w,
              ),
            ),
            child: Icon(
              Icons.check,
              size: 14.sp,
              color: const Color(0xFF76C38E),
            ),
          ),
          SizedBox(width: 10.w),
          Text(
            'Reset link sent successfully.',
            style: TextStyle(
              fontSize: 14.sp,
              color: const Color(0xFFA0A7A4),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}