import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getOnboardingStatus } from '../api/onboarding';
import { useAuthStore } from '../store/authStore';
<<<<<<< HEAD
import { Loader2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import ParkitLogo from '../assets/Parkit Logo.png';
=======
import { Loader2 } from 'lucide-react';
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Awaited<ReturnType<typeof getOnboardingStatus>> | null>(null);

  useEffect(() => {
    getOnboardingStatus()
      .then((s) => {
        setStatus(s);
        if (token && s.onboardingStatus === 'IN_PROGRESS') navigate('/onboarding', { replace: true });
        if (token && s.onboardingStatus === 'COMPLETED') navigate('/monitoring', { replace: true });
        if (!s.hasFacility && !token) return;
        if (s.onboardingStatus === 'COMPLETED' && !token) navigate('/login', { replace: true });
      })
      .catch(() => setStatus({ hasFacility: false, hasAdmin: false, onboardingStatus: null, onboardingStep: 0, facilityId: null }))
      .finally(() => setLoading(false));
  }, [navigate, token]);

  if (loading) {
    return (
<<<<<<< HEAD
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5]">
        <Loader2 className="animate-spin text-[#2E2E2E]" size={32} />
=======
      <div className="flex min-h-screen items-center justify-center bg-bg-base">
        <Loader2 className="animate-spin text-accent-brand" />
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
      </div>
    );
  }

  const inProgress = status?.onboardingStatus === 'IN_PROGRESS';
  const canStart = !status?.hasFacility;

  return (
<<<<<<< HEAD
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] p-6 font-sans">
      <div className="w-full max-w-2xl">
        <div className="mb-10 text-center flex flex-col items-center">
          {/* Official Parkit Logo in Clay Container */}
          <div className="mb-5 h-28 w-28 md:h-32 md:w-32 clay-logo-container p-4 flex items-center justify-center mx-auto">
            <img src={ParkitLogo} alt="Parkit Logo" className="h-full w-full object-contain" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-[#2E2E2E]">PARKIT SYSTEM</h1>
          <p className="mt-2 text-sm text-[#6E6E6E] max-w-md">
            Facility control room & smart parking intelligence — onboard once, then run live.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Start Onboarding Card */}
=======
    <div className="flex min-h-screen items-center justify-center bg-bg-base p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-brand font-display text-2xl text-white">
            P
          </div>
          <h1 className="font-display text-4xl tracking-wide">SMART PARKING</h1>
          <p className="mt-2 text-sm text-text-muted">Facility control room — onboard once, then run live.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
          <button
            type="button"
            disabled={!canStart}
            onClick={() => navigate('/onboarding')}
<<<<<<< HEAD
            className="clay-card-interactive p-8 text-left disabled:cursor-not-allowed disabled:opacity-40 flex flex-col justify-between group"
          >
            <div>
              <div className="h-10 w-10 rounded-2xl bg-[#F8F9FA] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04)] flex items-center justify-center mb-4 text-[#2E2E2E]">
                <Sparkles size={20} />
              </div>
              <p className="font-display text-2xl font-bold tracking-tight text-[#2E2E2E]">Start Onboarding</p>
              <p className="mt-2.5 text-sm text-[#6E6E6E] leading-relaxed">
                {canStart
                  ? 'Register this facility, cameras, slots, gates, and pricing.'
                  : 'A facility already exists on this install.'}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#2E2E2E] group-hover:translate-x-1 transition-transform">
              <span>Begin wizard</span>
              <ArrowRight size={14} />
            </div>
          </button>

          {/* Log In Card */}
          <Link
            to="/login"
            className="clay-card-interactive p-8 text-left flex flex-col justify-between group"
          >
            <div>
              <div className="h-10 w-10 rounded-2xl bg-[#F8F9FA] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04)] flex items-center justify-center mb-4 text-[#2E2E2E]">
                <ShieldCheck size={20} />
              </div>
              <p className="font-display text-2xl font-bold tracking-tight text-[#2E2E2E]">Log In</p>
              <p className="mt-2.5 text-sm text-[#6E6E6E] leading-relaxed">
                {inProgress ? 'Resume the onboarding wizard at your last saved step.' : 'Open the live monitoring control room.'}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#2E2E2E] group-hover:translate-x-1 transition-transform">
              <span>Sign in</span>
              <ArrowRight size={14} />
            </div>
=======
            className="rounded-xl border border-border-hairline bg-bg-surface p-8 text-left transition hover:border-accent-brand disabled:cursor-not-allowed disabled:opacity-40"
          >
            <p className="font-display text-2xl tracking-wide">Start Onboarding</p>
            <p className="mt-2 text-sm text-text-muted">
              {canStart
                ? 'Register this facility, cameras, slots, gates, and pricing.'
                : 'A facility already exists on this install.'}
            </p>
          </button>
          <Link
            to="/login"
            className="rounded-xl border border-border-hairline bg-bg-surface p-8 hover:border-accent-brand"
          >
            <p className="font-display text-2xl tracking-wide">Log In</p>
            <p className="mt-2 text-sm text-text-muted">
              {inProgress ? 'Resume the onboarding wizard at your last saved step.' : 'Open the live monitoring console.'}
            </p>
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
          </Link>
        </div>
      </div>
    </div>
  );
};
