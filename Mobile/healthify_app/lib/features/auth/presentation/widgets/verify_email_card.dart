import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'auth_primary_button.dart';
import 'resend_code_text.dart';
import 'success_message_chip.dart';
import 'verification_code_boxes.dart';

class VerifyEmailCard extends StatelessWidget {
  const VerifyEmailCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
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
      child: Row(
        children: [
          Container(
            width: 4.w,
            height: 360.h,
            decoration: BoxDecoration(
              color: const Color(0xFFD8A57C),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(28.r),
                bottomLeft: Radius.circular(28.r),
              ),
            ),
          ),
          Expanded(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 24.h),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 46.w,
                    height: 46.w,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8EDE2),
                      borderRadius: BorderRadius.circular(14.r),
                    ),
                    child: Icon(
                      Icons.mark_email_read_outlined,
                      color: const Color(0xFF9D4F0E),
                      size: 24.sp,
                    ),
                  ),
                  SizedBox(height: 24.h),
                  Text(
                    'Verify your Email',
                    style: TextStyle(
                      fontSize: 30.sp,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF202428),
                    ),
                  ),
                  SizedBox(height: 12.h),
                  RichText(
                    text: TextSpan(
                      style: TextStyle(
                        fontSize: 16.sp,
                        height: 1.55,
                        color: const Color(0xFF525C58),
                      ),
                      children: [
                        const TextSpan(
                          text: "We've sent a 4-digit code to\n",
                        ),
                        TextSpan(
                          text: 'jo***@gmail.com',
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF252A2E),
                            fontSize: 16.sp,
                          ),
                        ),
                        const TextSpan(
                          text: '. Please enter it below.',
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 26.h),
                  const VerificationCodeBoxes(),
                  Transform.translate(
                    offset: Offset(24.w, -10.h),
                    child: const SuccessMessageChip(),
                  ),
                  SizedBox(height: 8.h),
                  const AuthPrimaryButton(text: 'Verify Code'),
                  SizedBox(height: 18.h),
                  const Center(
                    child: ResendCodeText(),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}   