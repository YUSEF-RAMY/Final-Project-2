import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:healthify_app/core/di/service_locator.dart';
import 'package:healthify_app/core/services/storage_service.dart';
import 'package:healthify_app/core/utils/extensions/navigation_extensions.dart';
import '../widgets/ai_precision_card.dart';
import '../widgets/background_decoration.dart';
import '../widgets/footer_text.dart';
import '../widgets/logo_section.dart';
import 'package:healthify_app/core/shared_widgets/app_button.dart';

class SplashView extends StatefulWidget {
  const SplashView({super.key});

  @override
  State<SplashView> createState() => _SplashViewState();
}

class _SplashViewState extends State<SplashView> {
  @override
  void initState() {
    super.initState();
    _checkAuthAndNavigate();
  }

  Future<void> _checkAuthAndNavigate() async {
    // Ensure minimum branding time
    await Future.delayed(const Duration(seconds: 2));

    if (!mounted) return;

    final token = await sl<StorageService>().getAccessToken();
    if (token != null && token.isNotEmpty) {
      context.navigateToHome();
    } else {
      context.navigateToSignIn();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F8F6),
      body: Stack(
        children: [
          const BackgroundDecorations(),
          SafeArea(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 24.w),
              child: Column(
                children: [
                  SizedBox(height: 70.h),
                  const Spacer(),
                  const LogoSection(),
                  SizedBox(height: 40.h),
                  const AiPrecisionCard(),
                  SizedBox(height: 60.h),
                  // Subtle loading indicator while checking auth
                  SizedBox(
                    width: 28.w,
                    height: 28.w,
                    child: const CircularProgressIndicator(
                      strokeWidth: 2.5,
                      color: Color(0xFF0B8F3E),
                    ),
                  ),
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