import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Wraps FlutterSecureStorage (tokens) and SharedPreferences (settings).
class StorageService {
  final FlutterSecureStorage _secure;
  final SharedPreferences _prefs;

  const StorageService(this._secure, this._prefs);

  // ── Token ─────────────────────────────────────────────────────────

  Future<void> saveAccessToken(String token) =>
      _secure.write(key: _kToken, value: token);

  Future<String?> getAccessToken() => _secure.read(key: _kToken);

  Future<void> deleteAccessToken() => _secure.delete(key: _kToken);

  // ── Auth state ────────────────────────────────────────────────────

  bool get isLoggedIn => _prefs.getBool(_kIsLoggedIn) ?? false;

  Future<void> setLoggedIn(bool value) =>
      _prefs.setBool(_kIsLoggedIn, value);

  // ── Clear ─────────────────────────────────────────────────────────

  Future<void> clearTokens() async {
    await _secure.deleteAll();
    await _prefs.remove(_kIsLoggedIn);
  }

  // ── Keys ──────────────────────────────────────────────────────────

  static const _kToken = 'access_token';
  static const _kIsLoggedIn = 'is_logged_in';
}
