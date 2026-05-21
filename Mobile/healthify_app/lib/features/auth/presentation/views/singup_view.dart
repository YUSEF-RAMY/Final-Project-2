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
import '../widgets/sign_up_avatar_picker.dart';
import '../widgets/sign_up_header_section.dart';

class SignUpView extends StatefulWidget {
  const SignUpView({super.key});

  @override
  State<SignUpView> createState() => _SignUpViewState();
}

class _SignUpViewState extends State<SignUpView> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _onSubmit() {
    if (!_formKey.currentState!.validate()) return;
    context.read<AuthCubit>().register(
          name: _nameController.text.trim(),
          email: _emailController.text.trim(),
          password: _passwordController.text,
          passwordConfirmation: _confirmPasswordController.text,
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
                      // ── Back button ─────────────────────────────
                      GestureDetector(
                        onTap: context.pop,
                        child: Row(
                          children: [
                            Icon(Icons.arrow_back_ios_new_rounded,
                                size: 22.sp,
                                color: const Color(0xFF222222)),
                            SizedBox(width: 10.w),
                            Text(
                              'Healthyfy',
                              style: TextStyle(
                                fontSize: 22.sp,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF0B8F3E),
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: 28.h),
                      Expanded(
                        child: SingleChildScrollView(
                          child: Column(
                            children: [
                              const SignUpHeaderSection(),
                              SizedBox(height: 24.h),
                              const SignUpAvatarPicker(),
                              SizedBox(height: 24.h),
                              // ── Name ─────────────────────────────
                              AppTextField(
                                controller: _nameController,
                                hintText: 'John Doe',
                                label: 'Full Name',
                                validator: Validators.validateName,
                                textInputAction: TextInputAction.next,
                              ),
                              SizedBox(height: 16.h),
                              // ── Email ─────────────────────────────
                              AppTextField(
                                controller: _emailController,
                                hintText: 'john@example.com',
                                label: 'Email Address',
                                keyboardType: TextInputType.emailAddress,
                                validator: Validators.validateEmail,
                                textInputAction: TextInputAction.next,
                              ),
                              SizedBox(height: 16.h),
                              // ── Password ──────────────────────────
                              AppTextField(
                                controller: _passwordController,
                                hintText: '••••••••',
                                label: 'Password',
                                obscureText: true,
                                showPasswordToggle: true,
                                validator: Validators.validatePassword,
                                textInputAction: TextInputAction.next,
                              ),
                              SizedBox(height: 16.h),
                              // ── Confirm Password ──────────────────
                              AppTextField(
                                controller: _confirmPasswordController,
                                hintText: '••••••••',
                                label: 'Confirm Password',
                                obscureText: true,
                                showPasswordToggle: true,
                                validator: (v) =>
                                    Validators.validateConfirmPassword(
                                        _passwordController.text, v),
                                textInputAction: TextInputAction.done,
                                onEditingComplete: _onSubmit,
                              ),
                              SizedBox(height: 28.h),
                              // ── Submit button ─────────────────────
                              BlocBuilder<AuthCubit, AuthState>(
                                builder: (context, state) {
                                  return AppButton(
                                    text: 'Create Account',
                                    isLoading: state is AuthLoading,
                                    onPressed: _onSubmit,
                                  );
                                },
                              ),
                              SizedBox(height: 28.h),
                              const AuthDividerText(text: 'OR CONTINUE WITH'),
                              SizedBox(height: 20.h),
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
                              SizedBox(height: 36.h),
                              GestureDetector(
                                onTap: context.pop,
                                child: RichText(
                                  text: TextSpan(
                                    text: 'Already have an account? ',
                                    style: TextStyle(
                                      fontSize: 17.sp,
                                      color: const Color(0xFF4C544F),
                                    ),
                                    children: [
                                      TextSpan(
                                        text: 'Log In',
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
                              SizedBox(height: 30.h),
                            ],
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