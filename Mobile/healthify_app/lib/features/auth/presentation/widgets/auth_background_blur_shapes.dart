import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class AuthBackgroundBlurShapes extends StatelessWidget {
  const AuthBackgroundBlurShapes({super.key});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned(
          top: -30.h,
          right: -85.w,
          child: _blurCircle(
            size: 260.w,
            color: const Color(0xFF0A8E3F).withOpacity(0.65),
          ),
        ),
        Positioned(
          bottom: 120.h,
          left: -120.w,
          child: _blurCircle(
            size: 220.w,
            color: const Color(0xFFC66A24).withOpacity(0.55),
          ),
        ),
        Positioned(
          bottom: -80.h,
          right: -50.w,
          child: _blurCircle(
            size: 250.w,
            color: const Color(0xFF0C8D3E).withOpacity(0.60),
          ),
        ),
        Positioned.fill(
          child: Container(
            color: const Color(0xFFF8FAF8).withOpacity(0.82),
          ),
        ),
      ],
    );
  }

  Widget _blurCircle({
    required double size,
    required Color color,
  }) {
    return ImageFiltered(
      imageFilter: ImageFilter.blur(sigmaX: 65, sigmaY: 65),
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: color,
        ),
      ),
    );
  }
}