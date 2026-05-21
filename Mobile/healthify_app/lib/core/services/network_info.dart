import 'package:internet_connection_checker_plus/internet_connection_checker_plus.dart';

class NetworkInfo {
  final InternetConnection _checker;
  const NetworkInfo(this._checker);

  Future<bool> get isConnected => _checker.hasInternetAccess;
}
