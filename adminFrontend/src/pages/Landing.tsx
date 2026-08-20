import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getOnboardingStatus } from '../api/onboarding';
import { useAuthStore } from '../store/authStore';
import { Loader2 } from 'lucide-react';

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
      <div className="flex min-h-screen items-center justify-center bg-bg-base">
        <Loader2 className="animate-spin text-accent-brand" />
      </div>
    );
  }

  const inProgress = status?.onboardingStatus === 'IN_PROGRESS';
  const canStart = !status?.hasFacility;

  return (
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
          <button
            type="button"
            disabled={!canStart}
            onClick={() => navigate('/onboarding')}
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
          </Link>
        </div>
      </div>
    </div>
  );
};
