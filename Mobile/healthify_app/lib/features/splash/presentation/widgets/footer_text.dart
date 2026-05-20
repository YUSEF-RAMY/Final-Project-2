import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class FooterText extends StatelessWidget {
  const FooterText({super.key});

  @override
  Widget build(BuildContext context) {
    return Text(
      'ADVANCED NUTRITIONAL INTELLIGENCE • VER.\n2.4.0',
      textAlign: TextAlign.center,
      style: TextStyle(
        fontSize: 11.sp,
        height: 1.4,
        letterSpacing: 1.1,
        color: const Color(0xFFA8B3BF),
        fontWeight: FontWeight.w500,
      ),
    );
  }
}