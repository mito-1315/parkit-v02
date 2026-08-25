import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { loginAdmin, getMe } from '../api/auth';
import { getOnboardingStatus } from '../api/onboarding';
import { Lock, Mail, Loader2 } from 'lucide-react';
<<<<<<< HEAD
import ParkitLogo from '../assets/Parkit Logo.png';
=======
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d

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
<<<<<<< HEAD
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] p-6 font-sans">
      <div className="w-full max-w-md clay-card p-10 transform transition-all duration-300">
        <div className="mb-8 flex flex-col items-center text-center">
          {/* Official Parkit Logo in Clay Container */}
          <div className="mb-4 h-28 w-28 md:h-32 md:w-32 clay-logo-container p-4">
            <img src={ParkitLogo} alt="Parkit Logo" className="h-full w-full object-contain" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#2E2E2E]">CONTROL ROOM</h1>
          <p className="mt-1.5 text-sm text-[#6E6E6E]">Sign in to operate the smart parking facility</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8F9FA] p-3 text-center text-sm font-medium text-[#2E2E2E] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.03)]">
=======
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
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
              {error}
            </div>
          )}

<<<<<<< HEAD
          <div>
            <label className="block text-xs font-semibold text-[#6E6E6E] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
=======
          <label className="block text-xs font-medium text-text-muted">
            Email Address
            <div className="relative mt-1">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
<<<<<<< HEAD
                className="w-full clay-input py-3 pl-11 pr-4 text-sm font-medium text-[#2E2E2E]"
=======
                className="w-full rounded-md border border-border-hairline bg-bg-elevated py-2.5 pl-9 pr-3 text-text-primary"
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
                placeholder="admin@smartpark.com"
                required
              />
            </div>
<<<<<<< HEAD
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6E6E6E] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
=======
          </label>

          <label className="block text-xs font-medium text-text-muted">
            Password
            <div className="relative mt-1">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
<<<<<<< HEAD
                className="w-full clay-input py-3 pl-11 pr-4 text-sm font-medium text-[#2E2E2E]"
=======
                className="w-full rounded-md border border-border-hairline bg-bg-elevated py-2.5 pl-9 pr-3 text-text-primary"
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
                placeholder="••••••••"
                required
              />
            </div>
<<<<<<< HEAD
          </div>
=======
          </label>
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d

          <button
            type="submit"
            disabled={loading}
<<<<<<< HEAD
            className="w-full clay-btn-primary py-3.5 text-sm font-semibold tracking-wide disabled:opacity-50 mt-2"
=======
            className="flex w-full items-center justify-center gap-2 rounded-md bg-accent-brand py-2.5 font-medium text-white disabled:opacity-50"
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In'}
          </button>
        </form>

<<<<<<< HEAD
        <div className="mt-8 clay-inset p-3.5 text-center text-xs text-[#6E6E6E]">
          Demo credentials:{' '}
          <span className="font-mono font-semibold text-[#2E2E2E]">admin@smartpark.com</span> /{' '}
          <span className="font-mono font-semibold text-[#2E2E2E]">password123</span>
        </div>
=======
        <p className="mt-5 rounded-md border border-border-hairline bg-bg-elevated px-3 py-2 text-center text-xs text-text-muted">
          Demo credentials: <span className="font-mono text-text-primary">admin@centralplaza.com</span> /{' '}
          <span className="font-mono text-text-primary">password123</span>
        </p>
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
      </div>
    </div>
  );
};
