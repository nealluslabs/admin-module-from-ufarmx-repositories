import { create } from 'zustand';
import api from '../lib/api';
import { STORAGE_KEYS, storage } from '../lib/storage';

interface User {
  _id?: string;
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  phone?: string;
  adminId?: string;
  agentId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize from storage on store creation
  const token = storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
  const user = storage.get<User>(STORAGE_KEYS.USER);

  return {
    user: token && user ? user : null,
    isAuthenticated: !!(token && user),
    isLoading: false,

    login: async (email: string, password: string) => {
      set({ isLoading: true });
      try {
        const response = await api.post('/auth/login', { email, password });
        const { user, accessToken, refreshToken } = response.data.data;

        // Store tokens
        storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        storage.set(STORAGE_KEYS.USER, user);

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error: any) {
        set({ isLoading: false });
        throw error.response?.data?.message || error.message || 'Login failed';
      }
    },

    logout: () => {
      storage.clear();
      set({
        user: null,
        isAuthenticated: false,
      });
    },

    setUser: (user: User | null) => {
      set({ user, isAuthenticated: !!user });
    },

    checkAuth: async () => {
      const token = storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
      const user = storage.get<User>(STORAGE_KEYS.USER);

      if (token && user) {
        try {
          // Verify token is still valid
          const response = await api.get('/auth/me');
          set({
            user: response.data.data,
            isAuthenticated: true,
          });
          storage.set(STORAGE_KEYS.USER, response.data.data);
        } catch {
          // Token invalid, clear auth
          storage.clear();
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      } else {
        set({
          user: null,
          isAuthenticated: false,
        });
      }
    },
  };
});

