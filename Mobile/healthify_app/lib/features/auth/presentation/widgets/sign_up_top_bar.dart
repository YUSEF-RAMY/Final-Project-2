import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class SignUpTopBar extends StatelessWidget {
  const SignUpTopBar({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          'Healthyfy',
          style: TextStyle(
            fontSize: 22.sp,
            fontWeight: FontWeight.w700,
            color: const Color(0xFF0C8A43),
          ),
        ),
        const Spacer(),
        Container(
          width: 28.w,
          height: 28.w,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: const Color(0xFF7183A0),
              width: 1.5.w,
            ),
          ),
          child: Center(
            child: Text(
              '?',
              style: TextStyle(
                fontSize: 16.sp,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF7183A0),
              ),
            ),
          ),
        ),
      ],
    );
  }
}