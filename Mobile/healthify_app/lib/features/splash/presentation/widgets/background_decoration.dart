import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';


class _BackgroundDecorations extends StatelessWidget {
  const _BackgroundDecorations();

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned(
          top: -40.h,
          right: -90.w,
          child: _blurCircle(
            size: 320.w,
            color: const Color(0xFF0E8D43).withOpacity(0.55),
          ),
        ),
        Positioned(
          bottom: 40.h,
          left: -110.w,
          child: _blurCircle(
            size: 250.w,
            color: const Color(0xFFC56A24).withOpacity(0.55),
          ),
        ),
        Positioned.fill(
          child: Container(
            color: const Color(0xFFF7F8F6).withOpacity(0.82),
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
      imageFilter: ImageFilter.blur(sigmaX: 60, sigmaY: 60),
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
        ),
      ),
    );
  }
}