import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class LogoSection extends StatelessWidget {
  const LogoSection({super.key});

  @override
  Widget build(BuildContext context) {
     return Column(
      children: [
        Container(
          width: 96.w,
          height: 96.w,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(28.r),
            gradient: const LinearGradient(
              colors: [
                Color(0xFF0D8A43),
                Color(0xFF20C85A),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF1EB85A).withOpacity(0.25),
                blurRadius: 25.r,
                offset: Offset(0, 12.h),
              ),
            ],
          ),
          child: Center(
            child: Icon(
              Icons.eco_rounded,
              color: Colors.white,
              size: 42.sp,
            ),
          ),
        ),
        SizedBox(height: 22.h),
        Text(
          'Healthyfy',
          style: TextStyle(
            fontSize: 30.sp,
            fontWeight: FontWeight.w700,
            color: const Color(0xFF067A38),
            height: 1.1,
          ),
        ),
        SizedBox(height: 10.h),
        Text(
          'Your AI Nutrition Coach',
          style: TextStyle(
            fontSize: 16.sp,
            fontWeight: FontWeight.w400,
            color: const Color(0xFF4C5A53),
          ),
        ),
      ],
    );
  }
}