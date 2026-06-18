ThemeData get appTheme {
  return ThemeData(
    useMaterial3: true,

    scaffoldBackgroundColor: AppColors.surface,

    colorScheme: ColorScheme.light(
      primary: AppColors.primary,
      secondary: AppColors.secondary,
      surface: AppColors.surface,
      onSurface: AppColors.onSurface,
    ),

    splashFactory: NoSplash.splashFactory,

    highlightColor: Colors.transparent,
  );
}