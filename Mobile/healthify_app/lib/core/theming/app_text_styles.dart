import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import 'app_colors.dart';

abstract final class AppTextStyles {
  // Display

  static final TextStyle displayLarge = TextStyle(
    fontFamily: 'Manrope',
    fontSize: 48.sp,
    fontWeight: FontWeight.w700,
    letterSpacing: -1,
    color: AppColors.onSurface,
  );

  static final TextStyle displayMedium = TextStyle(
    fontFamily: 'Manrope',
    fontSize: 40.sp,
    fontWeight: FontWeight.w700,
    letterSpacing: -.8,
    color: AppColors.onSurface,
  );

  // Headlines

  static final TextStyle headlineLarge = TextStyle(
    fontFamily: 'Manrope',
    fontSize: 32.sp,
    fontWeight: FontWeight.w600,
    color: AppColors.onSurface,
  );

  static final TextStyle headlineMedium = TextStyle(
    fontFamily: 'Manrope',
    fontSize: 28.sp,
    fontWeight: FontWeight.w600,
    color: AppColors.onSurface,
  );

  // Titles

  static final TextStyle titleLarge = TextStyle(
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 20.sp,
    fontWeight: FontWeight.w600,
    color: AppColors.onSurface,
  );

  static final TextStyle titleMedium = TextStyle(
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 18.sp,
    fontWeight: FontWeight.w500,
    color: AppColors.onSurface,
  );

  // Body

  static final TextStyle bodyLarge = TextStyle(
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16.sp,
    fontWeight: FontWeight.w400,
    color: AppColors.onSurface,
  );

  static final TextStyle bodyMedium = TextStyle(
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14.sp,
    fontWeight: FontWeight.w400,
    color: AppColors.onSurfaceVariant,
  );

  static final TextStyle labelMedium = TextStyle(
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12.sp,
    fontWeight: FontWeight.w600,
    color: AppColors.primary,
  );
}