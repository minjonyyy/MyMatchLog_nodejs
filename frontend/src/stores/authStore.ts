import { create } from 'zustand'
import type { User } from '../types/auth'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthActions {
  setUser: (user: User) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setAccessToken: (accessToken: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>((set) => ({
  // 상태
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,

  // 액션
  setUser: (user: User) =>
    set({
      user,
      isAuthenticated: true,
    }),

  setTokens: (accessToken: string, refreshToken: string) =>
    set({
      accessToken,
      refreshToken,
    }),

  setAccessToken: (accessToken: string) =>
    set({
      accessToken,
    }),

  logout: () =>
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    }),

  setLoading: (loading: boolean) =>
    set({
      isLoading: loading,
    }),
})) 