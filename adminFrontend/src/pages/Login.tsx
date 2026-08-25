import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { loginAdmin, getMe } from '../api/auth';
import { getOnboardingStatus } from '../api/onboarding';
import { Lock, Mail, Loader2 } from 'lucide-react';
import ParkitLogo from '../assets/Parkit Logo.png';

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
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#6E6E6E] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full clay-input py-3 pl-11 pr-4 text-sm font-medium text-[#2E2E2E]"
                placeholder="admin@smartpark.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6E6E6E] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full clay-input py-3 pl-11 pr-4 text-sm font-medium text-[#2E2E2E]"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full clay-btn-primary py-3.5 text-sm font-semibold tracking-wide disabled:opacity-50 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 clay-inset p-3.5 text-center text-xs text-[#6E6E6E]">
          Demo credentials:{' '}
          <span className="font-mono font-semibold text-[#2E2E2E]">admin@smartpark.com</span> /{' '}
          <span className="font-mono font-semibold text-[#2E2E2E]">password123</span>
        </div>
      </div>
    </div>
  );
};
