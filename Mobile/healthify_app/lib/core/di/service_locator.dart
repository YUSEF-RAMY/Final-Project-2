import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get_it/get_it.dart';
import 'package:internet_connection_checker_plus/internet_connection_checker_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:healthify_app/core/networking/api_service.dart';
import 'package:healthify_app/core/networking/dio_factory.dart';
import 'package:healthify_app/core/services/network_info.dart';
import 'package:healthify_app/core/services/storage_service.dart';
import 'package:healthify_app/features/auth/di/auth_di.dart';

/// Global service-locator instance — use `sl<T>()` everywhere.
final GetIt sl = GetIt.instance;

/// Bootstrap all dependency registrations.
/// Called once from [main] before [runApp].
Future<void> setupServiceLocator() async {
  // ── External / Platform ──────────────────────────────────────────
  final sharedPrefs = await SharedPreferences.getInstance();
  sl.registerLazySingleton<SharedPreferences>(() => sharedPrefs);
  sl.registerLazySingleton<FlutterSecureStorage>(
    () => const FlutterSecureStorage(),
  );
  sl.registerLazySingleton<InternetConnection>(() => InternetConnection());

  // ── Core Services ────────────────────────────────────────────────
  sl.registerLazySingleton<StorageService>(
    () => StorageService(sl<FlutterSecureStorage>(), sl<SharedPreferences>()),
  );
  sl.registerLazySingleton<NetworkInfo>(
    () => NetworkInfo(sl<InternetConnection>()),
  );

  // ── Networking ───────────────────────────────────────────────────
  sl.registerLazySingleton(() => DioFactory.createDio());
  sl.registerLazySingleton<ApiService>(() => ApiService(sl()));

  // ── Features ─────────────────────────────────────────────────────
  setupAuthDi();
}
