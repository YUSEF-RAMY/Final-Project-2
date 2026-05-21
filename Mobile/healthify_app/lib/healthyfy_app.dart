import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:healthify_app/core/di/service_locator.dart';
import 'package:healthify_app/core/routing/app_router.dart';
import 'package:healthify_app/core/routing/route_names.dart';
import 'package:healthify_app/features/auth/presentation/cubit/auth_cubit.dart';

class HealthyfyApp extends StatelessWidget {
  const HealthyfyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ScreenUtilInit(
      designSize: const Size(390, 884),
      minTextAdapt: true,
      splitScreenMode: true,
      builder: (_, child) {
        return BlocProvider(
          create: (_) => sl<AuthCubit>(),
          child: MaterialApp(
            debugShowCheckedModeBanner: false,
            title: 'Healthyfy',
            initialRoute: RouteNames.splash,
            onGenerateRoute: AppRouter.generateRoute,
          ),
        );
      },
    );
  }
}