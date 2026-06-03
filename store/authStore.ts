import { create } from 'zustand';
import api from '../lib/api';

interface User {
  id: number;
  email: string;
  full_name: string;
  country: string;
  is_admin: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (access_token: string, refresh_token: string, user: User) => void;
  logout: () => void;
  setTokens: (access_token: string) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  login: (access_token, refresh_token, user) => {
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    set({
      accessToken: access_token,
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setTokens: (access_token) => {
    localStorage.setItem('access_token', access_token);
    set({ accessToken: access_token });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No token');
      
      set({ accessToken: token });
      
      try {
        // Fetch user profile
        const { data } = await api.get('/auth/me');
        set({ user: data, isAuthenticated: true, isLoading: false });
      } catch (err: any) {
        // If /auth/me fails, keep the token but don't authenticate fully
        console.warn('Could not fetch user profile:', err.message);
        set({ isLoading: false });
      }
    } catch (error) {
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      localStorage.removeItem('access_token');
    }
  },
}));
