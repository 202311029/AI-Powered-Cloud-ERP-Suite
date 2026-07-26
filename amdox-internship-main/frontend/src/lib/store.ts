import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { keycloak } from './keycloak';

interface UserState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: any) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('amdox_token');
        localStorage.removeItem('user');
        set({ token: null, user: null, isAuthenticated: false });
        if (keycloak) {
          keycloak.logout({ redirectUri: window.location.origin + '/login' });
        }
      },
    }),
    {
      name: 'amdox-auth-storage',
    }
  )
);

interface UIState {
  notifications: any[];
  showNotifs: boolean;
  isOnline: boolean;
  setOnline: (online: boolean) => void;
  toggleNotifs: () => void;
  setNotifications: (notifs: any[]) => void;
}

export const useUIStore = create<UIState>((set) => ({
  notifications: [],
  showNotifs: false,
  isOnline: true,
  setOnline: (isOnline) => set({ isOnline }),
  toggleNotifs: () => set((state) => ({ showNotifs: !state.showNotifs })),
  setNotifications: (notifications) => set({ notifications }),
}));
