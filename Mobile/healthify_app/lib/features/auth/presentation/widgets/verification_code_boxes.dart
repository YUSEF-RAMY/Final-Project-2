import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class VerificationCodeBoxes extends StatelessWidget {
  const VerificationCodeBoxes({super.key});

  @override
  Widget build(BuildContext context) {
    final values = ['8', '.', '.', '.'];

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: List.generate(
        values.length,
        (index) => Container(
          width: 56.w,
          height: 56.w,
          decoration: BoxDecoration(
            color: const Color(0xFFF1F3F7),
            borderRadius: BorderRadius.circular(16.r),
          ),
          alignment: Alignment.center,
          child: Text(
            values[index],
            style: TextStyle(
              fontSize: index == 0 ? 28.sp : 30.sp,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF252A2E),
            ),
          ),
        ),
      ),
    );
  }
}