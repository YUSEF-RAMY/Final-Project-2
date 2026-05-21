import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:healthify_app/core/shared_widgets/app_button.dart';
import 'package:healthify_app/core/utils/extensions/navigation_extensions.dart';
import 'package:healthify_app/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:healthify_app/features/auth/presentation/cubit/auth_state.dart';

class HomeView extends StatelessWidget {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthCubit, AuthState>(
      listener: (context, state) {
        if (state is AuthLoggedOut) {
          context.navigateToSignIn();
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF7F8F6),
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          centerTitle: false,
          title: Text(
            'Healthyfy',
            style: TextStyle(
              fontSize: 22.sp,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF0B8F3E),
            ),
          ),
          actions: [
            Padding(
              padding: EdgeInsets.only(right: 16.w),
              child: Icon(Icons.notifications_none_rounded,
                  color: const Color(0xFF3D4A42), size: 26.sp),
            ),
          ],
        ),
        body: SafeArea(
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: 24.w),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(height: 48.h),
                Text(
                  'Welcome back! 👋',
                  style: TextStyle(
                    fontSize: 28.sp,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF1A2822),
                  ),
                ),
                SizedBox(height: 12.h),
                Text(
                  'Your AI nutrition coach is ready\nto guide your journey.',
                  style: TextStyle(
                    fontSize: 17.sp,
                    height: 1.6,
                    color: const Color(0xFF4D5A53),
                  ),
                ),
                const Spacer(),
                BlocBuilder<AuthCubit, AuthState>(
                  builder: (context, state) {
                    return AppButton(
                      text: 'Log Out',
                      isLoading: state is AuthLoading,
                      buttonType: AppButtonType.outlined,
                      onPressed: () {
                        context.read<AuthCubit>().logout();
                      },
                    );
                  },
                ),
                SizedBox(height: 40.h),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
