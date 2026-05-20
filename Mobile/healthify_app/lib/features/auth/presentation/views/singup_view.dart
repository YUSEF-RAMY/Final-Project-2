import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../widgets/auth_background_blur_shapes.dart';
import '../widgets/auth_divider_text.dart';
import '../widgets/auth_social_button.dart';
import '../widgets/auth_text_field.dart';
import '../widgets/primary_auth_button.dart';
import '../widgets/sign_up_avatar_picker.dart';
import '../widgets/sign_up_bottom_login_text.dart';
import '../widgets/sign_up_header_section.dart';
import '../widgets/sign_up_top_bar.dart';

class SignUpScreen extends StatelessWidget {
  const SignUpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF8),
      body: Stack(
        children: [
          const AuthBackgroundBlurShapes(),
          SafeArea(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 24.w),
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    SizedBox(height: 18.h),
                    const SignUpTopBar(),
                    SizedBox(height: 34.h),
                    const SignUpHeaderSection(),
                    SizedBox(height: 28.h),
                    const SignUpAvatarPicker(),
                    SizedBox(height: 28.h),
                    const AuthTextField(
                      label: 'Full Name',
                      hintText: 'John Doe',
                    ),
                    SizedBox(height: 18.h),
                    const AuthTextField(
                      label: 'Email Address',
                      hintText: 'john@example.com',
                    ),
                    SizedBox(height: 18.h),
                    const AuthTextField(
                      label: 'Password',
                      hintText: '••••••••',
                      obscureText: true,
                      showSuffixIcon: true,
                    ),
                    SizedBox(height: 18.h),
                    const AuthTextField(
                      label: 'Confirm Password',
                      hintText: '••••••••',
                      obscureText: true,
                    ),
                    SizedBox(height: 28.h),
                    const PrimaryAuthButton(
                      text: 'Create Account',
                    ),
                    SizedBox(height: 28.h),
                    const AuthDividerText(text: 'OR CONTINUE WITH'),
                    SizedBox(height: 24.h),
                    const Row(
                      children: [
                        Expanded(
                          child: AuthSocialButton(
                            label: 'Google',
                            iconText: 'G',
                            iconColor: Color(0xFFDB4437),
                          ),
                        ),
                        SizedBox(width: 14),
                        Expanded(
                          child: AuthSocialButton(
                            label: 'Facebook',
                            iconText: 'f',
                            iconColor: Color(0xFF1877F2),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 44.h),
                    const SignUpBottomLoginText(),
                    SizedBox(height: 30.h),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}