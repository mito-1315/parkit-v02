import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'providers/auth_provider.dart';
import 'screens/active_session_screen.dart';
import 'screens/amount_due_screen.dart';
import 'screens/confirm_vehicle_screen.dart';
import 'screens/history_screen.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/register_screen.dart';
import 'screens/scan_gate_screen.dart';
import 'screens/slot_allocated_screen.dart';
import 'screens/vehicles_screen.dart';
import 'theme.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

/// Creates a [GoRouter] that is aware of the current [WidgetRef] so it can
/// read the auth provider for redirect logic.
GoRouter buildRouter(WidgetRef ref) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/home',
    redirect: (context, state) {
      final authValue = ref.read(authProvider);
      final isLoggedIn = authValue.value != null;
      final isOnAuth = state.matchedLocation == '/login' ||
          state.matchedLocation == '/register';

      if (!isLoggedIn && !isOnAuth) return '/login';
      if (isLoggedIn && isOnAuth) return '/home';
      return null;
    },
    refreshListenable: _AuthListenable(ref),
    routes: [
      GoRoute(
        path: '/login',
        builder: (_, __) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (_, __) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/home',
        builder: (_, __) => const HomeScreen(),
      ),
      GoRoute(
        path: '/vehicles',
        builder: (_, __) => const VehiclesScreen(),
      ),
      GoRoute(
        path: '/scan-gate',
        builder: (_, __) => const ScanGateScreen(),
      ),
      GoRoute(
        path: '/confirm-vehicle',
        builder: (_, state) {
          final gateId = int.tryParse(state.uri.queryParameters['gateId'] ?? '') ?? 1;
          return ConfirmVehicleScreen(gateId: gateId);
        },
      ),
      GoRoute(
        path: '/slot-allocated',
        builder: (_, __) => const SlotAllocatedScreen(),
      ),
      GoRoute(
        path: '/active-session',
        builder: (_, __) => const ActiveSessionScreen(),
      ),
      GoRoute(
        path: '/scan-exit',
        builder: (_, __) => const ScanGateScreen(isExit: true),
      ),
      GoRoute(
        path: '/amount-due',
        builder: (_, __) => const AmountDueScreen(),
      ),
      GoRoute(
        path: '/history',
        builder: (_, __) => const HistoryScreen(),
      ),
      GoRoute(
        path: '/profile',
        builder: (_, __) => const ProfileScreen(),
      ),
    ],
  );
}

/// Notifies [GoRouter] to re-evaluate redirects whenever the auth state changes.
class _AuthListenable extends ChangeNotifier {
  _AuthListenable(WidgetRef ref) {
    ref.listen(authProvider, (_, __) => notifyListeners());
  }
}

/// A [ConsumerWidget] that builds the router once and keeps it alive.
class RouterScope extends ConsumerStatefulWidget {
  const RouterScope({super.key});

  @override
  ConsumerState<RouterScope> createState() => _RouterScopeState();
}

class _RouterScopeState extends ConsumerState<RouterScope> {
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    _router = buildRouter(ref);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Parker — Smart Parking',
      debugShowCheckedModeBanner: false,
      theme: buildParkerTheme(),
      routerConfig: _router,
    );
  }
}
