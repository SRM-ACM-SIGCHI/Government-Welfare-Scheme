// lib/app.dart
// Root widget: binds GoRouter, AppTheme, localization delegates,
// and the active Locale from languageProvider.

import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'constants/app_theme.dart';
import 'providers/language_provider.dart';
import 'providers/profile_provider.dart';
import 'screens/home_screen.dart';
import 'screens/onboarding_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/scheme_detail_screen.dart';
import 'screens/schemes_screen.dart';
import 'screens/search_screen.dart';

// ── Shell with bottom navigation ─────────────────────────────
class _ShellScaffold extends StatelessWidget {
  final StatefulNavigationShell shell;
  const _ShellScaffold({required this.shell});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: shell,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: shell.currentIndex,
        onTap: (i) => shell.goBranch(i, initialLocation: i == shell.currentIndex),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined),   activeIcon: Icon(Icons.home),            label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.list_alt_outlined), activeIcon: Icon(Icons.list_alt),       label: 'Schemes'),
          BottomNavigationBarItem(icon: Icon(Icons.search_outlined),  activeIcon: Icon(Icons.search),          label: 'Search'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline),   activeIcon: Icon(Icons.person),          label: 'Profile'),
        ],
      ),
    );
  }
}

// ── Router ────────────────────────────────────────────────────
GoRouter _buildRouter(bool hasProfile) {
  return GoRouter(
    initialLocation: '/',
    routes: [
      // ── Shell (bottom nav tabs) ────────────────────────────
      StatefulShellRoute.indexedStack(
        builder: (_, __, shell) => _ShellScaffold(shell: shell),
        branches: [
          // Branch 0 – Home
          StatefulShellBranch(
            routes: [
              GoRoute(
                path:    '/',
                builder: (_, __) => const HomeScreen(),
              ),
            ],
          ),
          // Branch 1 – Schemes
          StatefulShellBranch(
            routes: [
              GoRoute(
                path:    '/schemes',
                builder: (_, __) => const SchemesScreen(),
                redirect: (_, state) {
                  if (!hasProfile) return '/onboarding';
                  return null;
                },
              ),
            ],
          ),
          // Branch 2 – Search
          StatefulShellBranch(
            routes: [
              GoRoute(
                path:    '/search',
                builder: (_, __) => const SearchScreen(),
              ),
            ],
          ),
          // Branch 3 – Profile
          StatefulShellBranch(
            routes: [
              GoRoute(
                path:    '/profile',
                builder: (_, __) => const ProfileScreen(),
                redirect: (_, state) {
                  if (!hasProfile) return '/onboarding';
                  return null;
                },
              ),
            ],
          ),
        ],
      ),

      // ── Full-screen routes (outside bottom nav) ────────────
      GoRoute(
        path:    '/onboarding',
        builder: (_, __) => const OnboardingScreen(),
      ),
      GoRoute(
        path:    '/schemes/:id',
        builder: (_, state) => SchemeDetailScreen(
          schemeId: state.pathParameters['id']!,
        ),
      ),
    ],
  );
}

// ── Root widget ───────────────────────────────────────────────
class WelfareApp extends ConsumerWidget {
  const WelfareApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locale     = ref.watch(localeProvider);
    final hasProfile = ref.watch(profileProvider) != null;

    // Router is recreated when hasProfile changes so redirect logic
    // picks up the new state immediately.
    final router = _buildRouter(hasProfile);

    return MaterialApp.router(
      title:        'Welfare Schemes',
      theme:        AppTheme.light,
      locale:       locale,
      routerConfig: router,

      // ── Localisation delegates ─────────────────────────────
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('en'),
        Locale('ta'),
        Locale('hi'),
      ],

      debugShowCheckedModeBanner: false,
    );
  }
}
