import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'header_section.dart';


class SignInScreen extends StatelessWidget {
  const SignInScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF8),
      body: Stack(
        children: [
          const _BackgroundBlurShapes(),
          SafeArea(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 24.w),
              child: Column(
                children: [
                  SizedBox(height: 18.h),
                  const _TopBar(),
                  SizedBox(height: 42.h),
                  const HeaderSection(),
                  SizedBox(height: 34.h),
                  const _SignInCard(),
                  SizedBox(height: 34.h),
                  const _BottomSignupText(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _InputLabel extends StatelessWidget {
  final String label;

  const _InputLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(
        label,
        style: TextStyle(
          fontSize: 16.sp,
          fontWeight: FontWeight.w600,
          color: const Color(0xFF434B45),
        ),
      ),
    );
  }
}

class _CustomTextField extends StatelessWidget {
  final String hintText;
  final bool obscureText;

  const _CustomTextField({
    required this.hintText,
    required this.obscureText,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 58.h,
      child: TextFormField(
        obscureText: obscureText,
        obscuringCharacter: '•',
        style: TextStyle(
          fontSize: 16.sp,
          color: const Color(0xFF23303B),
          fontWeight: FontWeight.w500,
        ),
        decoration: InputDecoration(
          hintText: hintText,
          hintStyle: TextStyle(
            fontSize: 16.sp,
            color: const Color(0xFF9AA8C2),
            fontWeight: FontWeight.w400,
          ),
          filled: true,
          fillColor: Colors.white.withOpacity(0.95),
          contentPadding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(22.r),
            borderSide: BorderSide(
              color: const Color(0xFFE7E4DF),
              width: 1.4.w,
            ),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(22.r),
            borderSide: BorderSide(
              color: const Color(0xFF16A34A),
              width: 1.5.w,
            ),
          ),
        ),
      ),
    );
  }
}

class _PrimaryButton extends StatelessWidget {
  const _PrimaryButton();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 58.h,
      child: ElevatedButton(
        onPressed: () {},
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF0B8F3E),
          foregroundColor: Colors.white,
          elevation: 0,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(30.r),
          ),
        ).copyWith(
          elevation: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.pressed)) return 0;
            return 0;
          }),
        ),
        child: Container(
          decoration: BoxDecoration(
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF12A84A).withOpacity(0.25),
                blurRadius: 18.r,
                offset: Offset(0, 8.h),
              ),
            ],
          ),
          child: Text(
            'Sign In',
            style: TextStyle(
              fontSize: 22.sp,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }
}

class _DividerText extends StatelessWidget {
  const _DividerText();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Container(
            height: 1.h,
            color: const Color(0xFFE8E7E2),
          ),
        ),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 14.w),
          child: Text(
            'Or continue with',
            style: TextStyle(
              fontSize: 16.sp,
              color: const Color(0xFF525A56),
              fontWeight: FontWeight.w400,
            ),
          ),
        ),
        Expanded(
          child: Container(
            height: 1.h,
            color: const Color(0xFFE8E7E2),
          ),
        ),
      ],
    );
  }
}

class _SocialButtonsRow extends StatelessWidget {
  const _SocialButtonsRow();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _SocialButton(
            label: 'Google',
            icon: 'G',
            iconColor: const Color(0xFFDB4437),
            backgroundColor: Colors.white,
          ),
        ),
        SizedBox(width: 14.w),
        Expanded(
          child: _SocialButton(
            label: 'Facebook',
            icon: 'f',
            iconColor: const Color(0xFF1877F2),
            backgroundColor: Colors.white,
          ),
        ),
      ],
    );
  }
}

class _SocialButton extends StatelessWidget {
  final String label;
  final String icon;
  final Color iconColor;
  final Color backgroundColor;

  const _SocialButton({
    required this.label,
    required this.icon,
    required this.iconColor,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 50.h,
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(25.r),
        border: Border.all(
          color: const Color(0xFFE7E4DF),
          width: 1.2.w,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 22.w,
            height: 22.w,
            alignment: Alignment.center,
            child: Text(
              icon,
              style: TextStyle(
                fontSize: label == 'Google' ? 22.sp : 20.sp,
                fontWeight: FontWeight.w700,
                color: iconColor,
              ),
            ),
          ),
          SizedBox(width: 10.w),
          Text(
            label,
            style: TextStyle(
              fontSize: 16.sp,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF49514B),
            ),
          ),
        ],
      ),
    );
  }
}

class _BottomSignupText extends StatelessWidget {
  const _BottomSignupText();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: 28.h),
      child: RichText(
        textAlign: TextAlign.center,
        text: TextSpan(
          text: "Don't have an account? ",
          style: TextStyle(
            fontSize: 18.sp,
            color: const Color(0xFF4C544F),
            fontWeight: FontWeight.w400,
          ),
          children: [
            TextSpan(
              text: 'Signup',
              style: TextStyle(
                fontSize: 18.sp,
                color: const Color(0xFF0B8F3E),
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BackgroundBlurShapes extends StatelessWidget {
  const _BackgroundBlurShapes();

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned(
          top: 75.h,
          left: -110.w,
          child: _blurCircle(
            size: 180.w,
            color: const Color(0xFFC56524).withOpacity(0.55),
          ),
        ),
        Positioned(
          bottom: -60.h,
          left: 20.w,
          child: _blurCircle(
            size: 300.w,
            color: const Color(0xFF098B3D).withOpacity(0.65),
          ),
        ),
        Positioned(
          bottom: 80.h,
          right: -80.w,
          child: _blurCircle(
            size: 130.w,
            color: const Color(0xFF13A34C).withOpacity(0.45),
          ),
        ),
        Positioned.fill(
          child: Container(
            color: const Color(0xFFF8FAF8).withOpacity(0.80),
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