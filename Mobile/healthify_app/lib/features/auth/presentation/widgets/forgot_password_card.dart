import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'auth_email_text_field.dart';
import 'auth_primary_button.dart';
import 'back_to_login_button.dart';
import 'forgot_password_header.dart';

class ForgotPasswordCard extends StatelessWidget {
  const ForgotPasswordCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 26.h),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.78),
        borderRadius: BorderRadius.circular(28.r),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 24.r,
            offset: Offset(0, 12.h),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const ForgotPasswordHeader(),
          SizedBox(height: 28.h),
          Text(
            'EMAIL ADDRESS',
            style: TextStyle(
              fontSize: 15.sp,
              letterSpacing: 1.1,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF4D5953),
            ),
          ),
          SizedBox(height: 10.h),
          const AuthEmailTextField(hintText: 'name@example.com'),
          SizedBox(height: 28.h),
          const AuthPrimaryButton(text: 'Send Code'),
          SizedBox(height: 20.h),
          const Center(
            child: BackToLoginButton(),
          ),
        ],
      ),
    );
  }
}