import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:healthify_app/core/shared_widgets/app_button.dart';
import 'package:healthify_app/core/shared_widgets/app_text_field.dart';
import 'package:healthify_app/core/utils/extensions/navigation_extensions.dart';
import 'package:healthify_app/core/utils/validators.dart';
import 'package:healthify_app/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:healthify_app/features/auth/presentation/cubit/auth_state.dart';
import '../widgets/auth_background_blur_shapes.dart';
import '../widgets/auth_brand_top_bar.dart';
import '../widgets/forgot_password_header.dart';

class ForgotPasswordView extends StatefulWidget {
  const ForgotPasswordView({super.key});

  @override
  State<ForgotPasswordView> createState() => _ForgotPasswordViewState();
}

class _ForgotPasswordViewState extends State<ForgotPasswordView> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  void _onSubmit() {
    if (!_formKey.currentState!.validate()) return;
    context.read<AuthCubit>().forgotPassword(_emailController.text.trim());
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthCubit, AuthState>(
      listener: (context, state) {
        if (state is AuthOtpSent) {
          context.navigateToOtpVerification(_emailController.text.trim());
        } else if (state is AuthError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: const Color(0xFFD32F2F),
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF7F9F7),
        body: Stack(
          children: [
            const AuthBackgroundBlurShapes(),
            SafeArea(
              child: SingleChildScrollView(
                padding:
                    EdgeInsets.symmetric(horizontal: 24.w, vertical: 18.h),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // ── Top bar with back arrow ───────────────────
                      GestureDetector(
                        onTap: context.pop,
                        child: const AuthBrandTopBar(showBackButton: true),
                      ),
                      SizedBox(height: 44.h),
                      // ── Header ────────────────────────────────────
                      const ForgotPasswordHeader(),
                      SizedBox(height: 36.h),
                      // ── Email field ───────────────────────────────
                      AppTextField(
                        controller: _emailController,
                        hintText: 'Enter your email address',
                        label: 'Email Address',
                        keyboardType: TextInputType.emailAddress,
                        validator: Validators.validateEmail,
                        textInputAction: TextInputAction.done,
                        onEditingComplete: _onSubmit,
                      ),
                      SizedBox(height: 32.h),
                      // ── Send Code button ──────────────────────────
                      BlocBuilder<AuthCubit, AuthState>(
                        builder: (context, state) {
                          return AppButton(
                            text: 'Send Code',
                            isLoading: state is AuthLoading,
                            onPressed: _onSubmit,
                          );
                        },
                      ),
                      SizedBox(height: 24.h),
                      // ── Back to login ─────────────────────────────
                      Center(
                        child: GestureDetector(
                          onTap: context.pop,
                          child: Text(
                            'Back to Login',
                            style: TextStyle(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF0B8F3E),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}