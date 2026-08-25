import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/auth_provider.dart';
import '../theme.dart';
import '../widgets/gradient_button.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    await ref.read(authProvider.notifier).login(
          email: _emailCtrl.text.trim(),
          password: _passCtrl.text,
        );
    if (!mounted) return;
    ref.read(authProvider).whenOrNull(
      error: (e, _) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceFirst('ApiException', '').trim()),
            backgroundColor: Pk.danger,
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final loading = authState is AsyncLoading;

    return Scaffold(
      backgroundColor: Pk.bg,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 28),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ─── Brand ───────────────────────────────────────────
                  Center(
                    child: Column(
                      children: [
                        Container(
<<<<<<< HEAD
                          width: 88,
                          height: 88,
                          decoration: BoxDecoration(
                            color: Pk.primary,
                            borderRadius: BorderRadius.circular(22),
                            boxShadow: [
                              BoxShadow(
                                color: Pk.primary.withOpacity(0.35),
                                blurRadius: 20,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          padding: const EdgeInsets.all(10),
                          child: Image.asset(
                            'assets/parkit_logo.png',
                            fit: BoxFit.contain,
=======
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            color: Pk.primary,
                            borderRadius: Pk.r8,
                          ),
                          child: const Icon(
                            Icons.local_parking_rounded,
                            color: Colors.white,
                            size: 34,
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
                          ),
                        ),
                        const SizedBox(height: 18),
                        const Text(
                          'Parkit',
                          style: TextStyle(
                            color: Pk.textPrimary,
                            fontSize: 32,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Smart parking at your fingertips',
                          style: TextStyle(
                            color: Pk.textSecondary,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),

                  // ─── Email ───────────────────────────────────────────
                  _label('Email'),
                  const SizedBox(height: 6),
                  TextFormField(
                    key: const Key('login_email_field'),
                    controller: _emailCtrl,
                    keyboardType: TextInputType.emailAddress,
                    style: const TextStyle(color: Pk.textPrimary, fontSize: 14),
                    decoration: pkInputDecoration(
                      hint: 'you@example.com',
                      icon: Icons.mail_outline_rounded,
                    ),
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) return 'Email is required';
                      if (!v.contains('@')) return 'Enter a valid email';
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  // ─── Password ────────────────────────────────────────
                  _label('Password'),
                  const SizedBox(height: 6),
                  TextFormField(
                    key: const Key('login_password_field'),
                    controller: _passCtrl,
                    obscureText: _obscure,
                    style: const TextStyle(color: Pk.textPrimary, fontSize: 14),
                    decoration: pkInputDecoration(
                      hint: '••••••••',
                      icon: Icons.lock_outline_rounded,
                      suffix: IconButton(
                        icon: Icon(
                          _obscure
                              ? Icons.visibility_off_outlined
                              : Icons.visibility_outlined,
                          color: Pk.textMuted,
                          size: 18,
                        ),
                        onPressed: () => setState(() => _obscure = !_obscure),
                      ),
                    ),
                    validator: (v) =>
                        (v == null || v.isEmpty) ? 'Password is required' : null,
                  ),
                  const SizedBox(height: 28),

                  // ─── Submit ──────────────────────────────────────────
                  GradientButton(
                    key: const Key('login_submit_button'),
                    label: 'Sign In',
                    icon: Icons.arrow_forward_rounded,
                    loading: loading,
                    onPressed: loading ? null : _submit,
                  ),
                  const SizedBox(height: 24),

                  // ─── Register link ───────────────────────────────────
                  Center(
                    child: GestureDetector(
                      onTap: () => context.push('/register'),
<<<<<<< HEAD
                      child: const Text.rich(
                        TextSpan(
                          text: "Don't have an account? ",
                          style: TextStyle(
=======
                      child: Text.rich(
                        TextSpan(
                          text: "Don't have an account? ",
                          style: const TextStyle(
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
                              color: Pk.textSecondary, fontSize: 13),
                          children: [
                            TextSpan(
                              text: 'Register',
                              style: TextStyle(
                                color: Pk.primary,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _label(String text) => Text(
        text,
        style: const TextStyle(
          color: Pk.textSecondary,
          fontSize: 12,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.4,
        ),
      );
}
