import { create } from 'zustand';
import { AuthTokens, User } from '../types';
import {
  loadTokens,
  loadUser,
  saveUser,
  logout as apiLogout,
  isTokenValid,
  getValidAccessToken,
  fetchUserInfo,
  exchangeCodeForTokens,
} from '../api/auth';
import { getOrCreateUser } from '../api/shm';

interface AuthState {
  // State
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: (code: string, codeVerifier: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Initialize auth state from storage
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      const [tokens, user] = await Promise.all([loadTokens(), loadUser()]);

      if (tokens && isTokenValid(tokens) && user) {
        set({
          tokens,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else if (tokens && !isTokenValid(tokens)) {
        // Try to refresh token
        const accessToken = await getValidAccessToken();
        if (accessToken) {
          const newTokens = await loadTokens();
          set({
            tokens: newTokens,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // Refresh failed, clear state
          await apiLogout();
          set({
            tokens: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({
        isLoading: false,
        error: 'Failed to initialize authentication',
      });
    }
  },

  // Complete OAuth login flow
  login: async (code: string, codeVerifier: string) => {
    try {
      set({ isLoading: true, error: null });

      // Exchange code for tokens
      const tokens = await exchangeCodeForTokens(code, codeVerifier);

      // Fetch user info from Apaleo
      const apaleoUser = await fetchUserInfo(tokens.accessToken);

      // Sync/create user in SHM backend
      const shmUser = await getOrCreateUser({
        apaleoId: apaleoUser.id!,
        email: apaleoUser.email!,
        firstName: apaleoUser.firstName!,
        lastName: apaleoUser.lastName!,
      });

      // Save user locally
      await saveUser(shmUser);

      set({
        tokens,
        user: shmUser,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Login error:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      set({ isLoading: true });
      await apiLogout();
      set({
        tokens: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even on error
      set({
        tokens: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  // Update user profile
  updateUser: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    await saveUser(updatedUser);
    set({ user: updatedUser });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
