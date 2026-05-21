import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:healthify_app/core/di/service_locator.dart';
import 'package:healthify_app/healthyfy_app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  await setupServiceLocator();

  runApp(const HealthyfyApp());
}
