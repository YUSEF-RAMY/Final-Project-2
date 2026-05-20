import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../widgets/auth_background_blur_shapes.dart';
import '../widgets/auth_brand_top_bar.dart';
import '../widgets/forgot_password_card.dart';
import '../widgets/verify_email_card.dart';

class ForgotPasswordView extends StatelessWidget {
  const ForgotPasswordView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7),
      body: Stack(
        children: [
          const AuthBackgroundBlurShapes(),
          SafeArea(
            child: SingleChildScrollView(
              padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 18.h),
              child: Column(
                children: [
                  const AuthBrandTopBar(showBackButton: true),
                  SizedBox(height: 44.h),
                  const ForgotPasswordCard(),
                  SizedBox(height: 34.h),
                  const VerifyEmailCard(),
                  SizedBox(height: 24.h),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}