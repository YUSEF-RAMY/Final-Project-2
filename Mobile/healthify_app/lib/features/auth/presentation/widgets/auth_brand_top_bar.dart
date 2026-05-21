import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class AuthBrandTopBar extends StatelessWidget {
  final bool showBackButton;

  const AuthBrandTopBar({
    super.key,
    this.showBackButton = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        if (showBackButton) ...[
          Icon(
            Icons.arrow_back_ios_new_rounded,
            size: 22.sp,
            color: const Color(0xFF222222),
          ),
          SizedBox(width: 10.w),
        ],
        Text(
          'Healthyfy',
          style: TextStyle(
            fontSize: 22.sp,
            fontWeight: FontWeight.w700,
            color: const Color(0xFF0B8F3E),
          ),
        ),
        const Spacer(),
        Container(
          width: 28.w,
          height: 28.w,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: const Color(0xFF70819D),
              width: 1.3.w,
            ),
          ),
          child: Center(
            child: Text(
              '?',
              style: TextStyle(
                fontSize: 16.sp,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF70819D),
              ),
            ),
          ),
        ),
      ],
    );
  }
}