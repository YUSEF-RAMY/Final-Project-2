import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

/// Button style variants.
enum AppButtonType { primary, secondary, outlined }

/// Unified, reusable button for the entire app.
///
/// Replaces: `PrimaryButton`, `SecondryButton`, `AuthPrimaryButton`.
class AppButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool enabled;
  final AppButtonType buttonType;

  const AppButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.enabled = true,
    this.buttonType = AppButtonType.primary,
  });

  @override
  Widget build(BuildContext context) {
    final isDisabled = !enabled || isLoading;

    switch (buttonType) {
      case AppButtonType.primary:
        return _PrimaryBtn(
            text: text,
            onPressed: isDisabled ? null : onPressed,
            isLoading: isLoading);
      case AppButtonType.secondary:
        return _SecondaryBtn(
            text: text,
            onPressed: isDisabled ? null : onPressed,
            isLoading: isLoading);
      case AppButtonType.outlined:
        return _OutlinedBtn(
            text: text,
            onPressed: isDisabled ? null : onPressed,
            isLoading: isLoading);
    }
  }
}

// ── Private variant widgets ───────────────────────────────────────

class _PrimaryBtn extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;

  const _PrimaryBtn(
      {required this.text, this.onPressed, required this.isLoading});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 58.h,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF0B8F3E),
          disabledBackgroundColor: const Color(0xFF0B8F3E).withValues(alpha: 0.55),
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(30.r)),
        ),
        child: _child(text, isLoading),
      ),
    );
  }
}

class _SecondaryBtn extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;

  const _SecondaryBtn(
      {required this.text, this.onPressed, required this.isLoading});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 54.h,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          backgroundColor: Colors.white.withValues(alpha: 0.75),
          foregroundColor: const Color(0xFF067A38),
          side: BorderSide.none,
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(28.r)),
        ),
        child: _child(text, isLoading),
      ),
    );
  }
}

class _OutlinedBtn extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;

  const _OutlinedBtn(
      {required this.text, this.onPressed, required this.isLoading});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 54.h,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          foregroundColor: const Color(0xFF0B8F3E),
          side: const BorderSide(color: Color(0xFF0B8F3E), width: 1.5),
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(28.r)),
        ),
        child: _child(text, isLoading),
      ),
    );
  }
}

// ── Shared child widget (text / spinner) ──────────────────────────

Widget _child(String text, bool isLoading) {
  if (isLoading) {
    return const SizedBox(
      width: 22,
      height: 22,
      child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
    );
  }
  return Text(
    text,
    style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.w700),
  );
}
