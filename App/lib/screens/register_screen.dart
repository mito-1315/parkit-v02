import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/auth_provider.dart';
import '../theme.dart';
import '../widgets/gradient_button.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    await ref.read(authProvider.notifier).register(
          name: _nameCtrl.text.trim(),
          email: _emailCtrl.text.trim(),
          password: _passCtrl.text,
          phone: _phoneCtrl.text.trim().isEmpty ? null : _phoneCtrl.text.trim(),
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
      appBar: AppBar(
        backgroundColor: Pk.bg,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          color: Pk.textSecondary,
          onPressed: () => context.pop(),
        ),
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 4),
                const Text(
                  'Create Account',
                  style: TextStyle(
                    color: Pk.textPrimary,
                    fontSize: 26,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.3,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Join Parkit and park smarter',
                  style: TextStyle(color: Pk.textSecondary, fontSize: 13),
                ),
                const SizedBox(height: 28),

                _label('Full Name'),
                const SizedBox(height: 6),
                TextFormField(
                  key: const Key('register_name_field'),
                  controller: _nameCtrl,
                  style: const TextStyle(color: Pk.textPrimary, fontSize: 14),
                  decoration: pkInputDecoration(
                    hint: 'John Doe',
                    icon: Icons.person_outline_rounded,
                  ),
                  validator: (v) =>
                      (v == null || v.trim().isEmpty) ? 'Name is required' : null,
                ),
                const SizedBox(height: 14),

                _label('Email'),
                const SizedBox(height: 6),
                TextFormField(
                  key: const Key('register_email_field'),
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
                const SizedBox(height: 14),

                _label('Password'),
                const SizedBox(height: 6),
                TextFormField(
                  key: const Key('register_password_field'),
                  controller: _passCtrl,
                  obscureText: _obscure,
                  style: const TextStyle(color: Pk.textPrimary, fontSize: 14),
                  decoration: pkInputDecoration(
                    hint: 'Min. 6 characters',
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
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Password is required';
                    if (v.length < 6) return 'Minimum 6 characters';
                    return null;
                  },
                ),
                const SizedBox(height: 14),

                _label('Phone (optional)'),
                const SizedBox(height: 6),
                TextFormField(
                  key: const Key('register_phone_field'),
                  controller: _phoneCtrl,
                  keyboardType: TextInputType.phone,
                  style: const TextStyle(color: Pk.textPrimary, fontSize: 14),
                  decoration: pkInputDecoration(
                    hint: '+1 555 123 4567',
                    icon: Icons.phone_outlined,
                  ),
                ),
                const SizedBox(height: 28),

                GradientButton(
                  key: const Key('register_submit_button'),
                  label: 'Create Account',
                  icon: Icons.check_rounded,
                  loading: loading,
                  onPressed: loading ? null : _submit,
                ),
                const SizedBox(height: 20),

                Center(
                  child: GestureDetector(
                    onTap: () => context.pop(),
                    child: Text.rich(
                      TextSpan(
                        text: 'Already have an account? ',
                        style:
                            const TextStyle(color: Pk.textSecondary, fontSize: 13),
                        children: [
                          TextSpan(
                            text: 'Sign In',
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
                const SizedBox(height: 32),
              ],
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
