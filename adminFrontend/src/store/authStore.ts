import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  facility_id: number | null;
}

interface AuthState {
  token: string | null;
  user: AdminUser | null;
  activeFacilityId: number | null;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
  setActiveFacility: (facilityId: number | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      activeFacilityId: null,
      login: (token, user) => set({ token, user, activeFacilityId: user.facility_id }),
      logout: () => set({ token: null, user: null, activeFacilityId: null }),
      setActiveFacility: (activeFacilityId) => set({ activeFacilityId }),
    }),
    { name: 'admin-auth' },
  ),
);
