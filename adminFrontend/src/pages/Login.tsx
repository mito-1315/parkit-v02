import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { loginAdmin, getMe } from '../api/auth';
import { getOnboardingStatus } from '../api/onboarding';
import { Lock, Mail, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);

    try {
      const { accessToken } = await loginAdmin({ email, password });
      useAuthStore.setState({ token: accessToken });
      const user = await getMe();
      login(accessToken, {
        id: user.admin_id ?? user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        facility_id: user.facility_id,
      });
      const status = await getOnboardingStatus();
      navigate(status.onboardingStatus === 'IN_PROGRESS' ? '/onboarding' : '/monitoring');
    } catch (err: any) {
      const payload = err.response?.data?.error;
      const message = payload?.message || payload || 'Invalid credentials';
      setError(typeof message === 'string' ? message : 'Invalid credentials');
      useAuthStore.setState({ token: null });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base p-4">
      <div className="w-full max-w-md rounded-xl border border-border-hairline bg-bg-surface p-8">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-brand font-display text-2xl text-white">
            P
          </div>
          <h1 className="font-display text-3xl tracking-wide">CONTROL ROOM</h1>
          <p className="mt-1 text-sm text-text-muted">Sign in to operate the facility</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-signal-occupied/30 bg-signal-occupied/10 p-2.5 text-center text-sm text-signal-occupied">
              {error}
            </div>
          )}

          <label className="block text-xs font-medium text-text-muted">
            Email Address
            <div className="relative mt-1">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-border-hairline bg-bg-elevated py-2.5 pl-9 pr-3 text-text-primary"
                placeholder="admin@smartpark.com"
                required
              />
            </div>
          </label>

          <label className="block text-xs font-medium text-text-muted">
            Password
            <div className="relative mt-1">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-border-hairline bg-bg-elevated py-2.5 pl-9 pr-3 text-text-primary"
                placeholder="••••••••"
                required
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-accent-brand py-2.5 font-medium text-white disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In'}
          </button>
        </form>

        <p className="mt-5 rounded-md border border-border-hairline bg-bg-elevated px-3 py-2 text-center text-xs text-text-muted">
          Demo credentials: <span className="font-mono text-text-primary">admin@centralplaza.com</span> /{' '}
          <span className="font-mono text-text-primary">password123</span>
        </p>
      </div>
    </div>
  );
};
