import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:healthify_app/core/shared_widgets/app_button.dart';
import 'package:healthify_app/core/utils/extensions/navigation_extensions.dart';
import 'package:healthify_app/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:healthify_app/features/auth/presentation/cubit/auth_state.dart';
import '../widgets/auth_background_blur_shapes.dart';
import '../widgets/auth_brand_top_bar.dart';

class OtpVerificationView extends StatefulWidget {
  final String email;

  const OtpVerificationView({super.key, required this.email});

  @override
  State<OtpVerificationView> createState() => _OtpVerificationViewState();
}

class _OtpVerificationViewState extends State<OtpVerificationView> {
  // ── OTP controllers & focus nodes ─────────────────────────────────
  final List<TextEditingController> _controllers =
      List.generate(4, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(4, (_) => FocusNode());

  // ── Countdown timer (45 s) ────────────────────────────────────────
  static const _countdownSeconds = 45;
  int _remaining = _countdownSeconds;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    for (final c in _controllers) c.dispose();
    for (final f in _focusNodes) f.dispose();
    super.dispose();
  }

  // ── Timer helpers ─────────────────────────────────────────────────

  void _startTimer() {
    _remaining = _countdownSeconds;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_remaining == 0) {
        _timer?.cancel();
      } else {
        setState(() => _remaining--);
      }
    });
  }

  void _resendCode() {
    for (final c in _controllers) c.clear();
    _focusNodes[0].requestFocus();
    context.read<AuthCubit>().forgotPassword(widget.email);
    _startTimer();
  }

  // ── OTP auto-advance ──────────────────────────────────────────────

  void _onDigitChanged(String value, int index) {
    if (value.isNotEmpty && index < 3) {
      _focusNodes[index + 1].requestFocus();
    } else if (value.isEmpty && index > 0) {
      _focusNodes[index - 1].requestFocus();
    }
  }

  // ── Verify submission ─────────────────────────────────────────────

  void _onVerify() {
    final code = _controllers.map((c) => c.text).join();
    if (code.length < 4) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter all 4 digits'),
          backgroundColor: Color(0xFFD32F2F),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }
    context.read<AuthCubit>().verifyOtp(widget.email, int.parse(code));
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthCubit, AuthState>(
      listener: (context, state) {
        if (state is AuthOtpVerified) {
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
        backgroundColor: const Color(0xFFF7F9F7),
        body: Stack(
          children: [
            const AuthBackgroundBlurShapes(),
            SafeArea(
              child: SingleChildScrollView(
                padding:
                    EdgeInsets.symmetric(horizontal: 24.w, vertical: 18.h),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── Top bar ───────────────────────────────────────
                    GestureDetector(
                      onTap: context.pop,
                      child: const AuthBrandTopBar(showBackButton: true),
                    ),
                    SizedBox(height: 44.h),

                    // ── Heading ───────────────────────────────────────
                    Text(
                      'Verify Your Email',
                      style: TextStyle(
                        fontSize: 30.sp,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF202428),
                      ),
                    ),
                    SizedBox(height: 14.h),
                    RichText(
                      text: TextSpan(
                        text: 'We sent a 4-digit code to\n',
                        style: TextStyle(
                          fontSize: 16.sp,
                          height: 1.55,
                          color: const Color(0xFF525C58),
                        ),
                        children: [
                          TextSpan(
                            text: widget.email,
                            style: const TextStyle(
                              color: Color(0xFF0B8F3E),
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: 40.h),

                    // ── 4-digit OTP boxes ─────────────────────────────
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: List.generate(4, (i) {
                        return SizedBox(
                          width: 64.w,
                          height: 64.w,
                          child: TextFormField(
                            controller: _controllers[i],
                            focusNode: _focusNodes[i],
                            keyboardType: TextInputType.number,
                            textAlign: TextAlign.center,
                            maxLength: 1,
                            inputFormatters: [
                              FilteringTextInputFormatter.digitsOnly
                            ],
                            style: TextStyle(
                              fontSize: 26.sp,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF1E2722),
                            ),
                            decoration: InputDecoration(
                              counterText: '',
                              filled: true,
                              fillColor: const Color(0xFFF1F3F7),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(16.r),
                                borderSide: BorderSide.none,
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(16.r),
                                borderSide: BorderSide(
                                  color: const Color(0xFF0B8F3E),
                                  width: 2.w,
                                ),
                              ),
                            ),
                            onChanged: (v) => _onDigitChanged(v, i),
                          ),
                        );
                      }),
                    ),
                    SizedBox(height: 36.h),

                    // ── Verify button ─────────────────────────────────
                    BlocBuilder<AuthCubit, AuthState>(
                      builder: (context, state) {
                        return AppButton(
                          text: 'Verify Code',
                          isLoading: state is AuthLoading,
                          onPressed: _onVerify,
                        );
                      },
                    ),
                    SizedBox(height: 28.h),

                    // ── Resend code with countdown ────────────────────
                    Center(
                      child: _remaining > 0
                          ? RichText(
                              text: TextSpan(
                                text: 'Resend code in ',
                                style: TextStyle(
                                  fontSize: 15.sp,
                                  color: const Color(0xFF6B766D),
                                ),
                                children: [
                                  TextSpan(
                                    text: '${_remaining}s',
                                    style: const TextStyle(
                                      color: Color(0xFF0B8F3E),
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ],
                              ),
                            )
                          : GestureDetector(
                              onTap: _resendCode,
                              child: Text(
                                'Resend Code',
                                style: TextStyle(
                                  fontSize: 15.sp,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFF0B8F3E),
                                ),
                              ),
                            ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
