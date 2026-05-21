import 'dart:ui';
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
import '../widgets/auth_divider_text.dart';
import '../widgets/auth_social_button.dart';
import '../widgets/signin_top_bar.dart';

class SignInView extends StatefulWidget {
  const SignInView({super.key});

  @override
  State<SignInView> createState() => _SignInViewState();
}

class _SignInViewState extends State<SignInView> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _onSubmit() {
    if (!_formKey.currentState!.validate()) return;
    context.read<AuthCubit>().login(
          _emailController.text.trim(),
          _passwordController.text,
        );
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthCubit, AuthState>(
      listener: (context, state) {
        if (state is AuthSuccess) {
          context.navigateToHome();
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
        backgroundColor: const Color(0xFFF8FAF8),
        body: Stack(
          children: [
            const AuthBackgroundBlurShapes(),
            SafeArea(
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 24.w),
                child: Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      SizedBox(height: 18.h),
                      const SigninTopBar(),
                      SizedBox(height: 42.h),
                      Column(
                        children: [
                          Text(
                            'Welcome Back',
                            style: TextStyle(
                              fontSize: 34.sp,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF212529),
                            ),
                          ),
                          SizedBox(height: 12.h),
                          Text(
                            'Sign in to your Healthyfy sanctuary',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 18.sp,
                              color: const Color(0xFF4D5A53),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 30.h),
                      Expanded(
                        child: SingleChildScrollView(
                          child: Column(
                            children: [
                              // ── Email ────────────────────────────
                              AppTextField(
                                controller: _emailController,
                                hintText: 'name@example.com',
                                label: 'Email Address',
                                keyboardType: TextInputType.emailAddress,
                                validator: Validators.validateEmail,
                                textInputAction: TextInputAction.next,
                              ),
                              SizedBox(height: 8.h),
                              // ── Forgot Password link ─────────────
                              Align(
                                alignment: Alignment.centerRight,
                                child: GestureDetector(
                                  onTap: context.navigateToForgotPassword,
                                  child: Text(
                                    'Forgot Password?',
                                    style: TextStyle(
                                      fontSize: 14.sp,
                                      fontWeight: FontWeight.w600,
                                      color: const Color(0xFFB45A11),
                                    ),
                                  ),
                                ),
                              ),
                              SizedBox(height: 10.h),
                              // ── Password ─────────────────────────
                              AppTextField(
                                controller: _passwordController,
                                hintText: '••••••••',
                                label: 'Password',
                                obscureText: true,
                                showPasswordToggle: true,
                                validator: Validators.validatePassword,
                                textInputAction: TextInputAction.done,
                                onEditingComplete: _onSubmit,
                              ),
                              SizedBox(height: 28.h),
                              // ── Sign In button ───────────────────
                              BlocBuilder<AuthCubit, AuthState>(
                                builder: (context, state) {
                                  return AppButton(
                                    text: 'Sign In',
                                    isLoading: state is AuthLoading,
                                    onPressed: _onSubmit,
                                  );
                                },
                              ),
                              SizedBox(height: 34.h),
                              const AuthDividerText(text: 'OR CONTINUE WITH'),
                              SizedBox(height: 24.h),
                              Row(
                                children: [
                                  Expanded(
                                    child: AuthSocialButton(
                                      label: 'Google',
                                      iconText: 'G',
                                      iconColor: const Color(0xFFDB4437),
                                    ),
                                  ),
                                  SizedBox(width: 14.w),
                                  Expanded(
                                    child: AuthSocialButton(
                                      label: 'Facebook',
                                      iconText: 'f',
                                      iconColor: const Color(0xFF1877F2),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      // ── Sign Up prompt ───────────────────────────
                      GestureDetector(
                        onTap: context.navigateToSignUp,
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: 24.h),
                          child: RichText(
                            text: TextSpan(
                              text: "Don't have an account? ",
                              style: TextStyle(
                                fontSize: 17.sp,
                                color: const Color(0xFF4C544F),
                              ),
                              children: [
                                TextSpan(
                                  text: 'Sign Up',
                                  style: TextStyle(
                                    fontSize: 17.sp,
                                    color: const Color(0xFF0B8F3E),
                                    fontWeight: FontWeight.w700,
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
              ),
            ),
          ],
        ),
      ),
    );
  }
}