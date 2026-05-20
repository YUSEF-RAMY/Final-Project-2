import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:healthify_app/features/splash/presentation/widgets/logo_section.dart';
import 'package:healthify_app/core/shared_widgets/primary_button.dart';
import 'package:healthify_app/core/shared_widgets/secondry_button.dart';
import 'package:healthify_app/features/splash/presentation/widgets/footer_text.dart';
import 'package:healthify_app/features/splash/presentation/widgets/ai_precision_card.dart'; 
import 'package:healthify_app/features/splash/presentation/widgets/background_decoration.dart'; 

class SplashView extends StatelessWidget {
  const SplashView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F8F6),
      body: Stack(
        children: [
          const _BackgroundDecorations(),
          SafeArea(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 24.w),
              child: Column(
                children: [
                  SizedBox(height: 70.h),
                  const Spacer(),
                  const LogoSection(),
                  SizedBox(height: 40.h),
                  const _AiPrecisionCard(),
                  SizedBox(height: 48.h),
                  const PrimaryButton(),
                  SizedBox(height: 16.h),
                  const SecondryButton(),
                  SizedBox(height: 48.h),
                  const FooterText(),
                  SizedBox(height: 30.h),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}