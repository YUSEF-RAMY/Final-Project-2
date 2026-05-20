import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class SignUpAvatarPicker extends StatelessWidget {
  const SignUpAvatarPicker({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SizedBox(
        width: 116.w,
        height: 116.w,
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Container(
              width: 116.w,
              height: 116.w,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: Colors.white,
                  width: 3.w,
                ),
                color: Colors.white.withOpacity(0.18),
              ),
              child: Icon(
                Icons.account_circle_outlined,
                size: 42.sp,
                color: const Color(0xFF7B877D),
              ),
            ),
            Positioned(
              right: -2.w,
              bottom: 6.h,
              child: Container(
                width: 34.w,
                height: 34.w,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0xFF0B8F3E),
                ),
                child: Icon(
                  Icons.camera_alt_outlined,
                  color: Colors.white,
                  size: 18.sp,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}