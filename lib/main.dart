// lib/main.dart
// App entry point.
// 1. Initialises StorageService (SharedPreferences) before runApp.
// 2. Wraps the widget tree in ProviderScope (Riverpod).

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app.dart';
import 'services/storage_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await StorageService.instance.init();
  runApp(const ProviderScope(child: WelfareApp()));
}
