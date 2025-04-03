import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, login as apiLogin, register as apiRegister, getCurrentUser } from '@/lib/api/auth';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, role?: 'CASE_MANAGER' | 'ADMIN') => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiLogin({ username, password });
          if (response.error || !response.data) {
            throw new Error(response.error || 'Login failed');
          }
          
          set({ token: response.data.token, isLoading: false });
          
          // Fetch user details
          const userResponse = await getCurrentUser(response.data.token);
          if (userResponse.error || !userResponse.data) {
            throw new Error(userResponse.error || 'Failed to fetch user details');
          }
          
          set({ user: userResponse.data });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Login failed', isLoading: false });
        }
      },

      register: async (username: string, password: string, role?: 'CASE_MANAGER' | 'ADMIN') => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiRegister({ username, password, role });
          if (response.error || !response.data) {
            throw new Error(response.error || 'Registration failed');
          }
          
          // Auto login after registration
          await get().login(username, password);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Registration failed', isLoading: false });
        }
      },

      logout: () => {
        set({ token: null, user: null, error: null });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

export function useAuthCheck() {
  const { token, user, login } = useAuth();
  return { isAuthenticated: !!token && !!user, token, user };
} 