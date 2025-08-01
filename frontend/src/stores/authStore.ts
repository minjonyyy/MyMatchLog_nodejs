import { create } from 'zustand'
import type { User } from '../types/auth'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean // 초기화 완료 여부
}

interface AuthActions {
  setUser: (user: User) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setAccessToken: (accessToken: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>((set) => ({
  // 상태 - localStorage에서 초기값 가져오기
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false, // 초기화 완료 여부

  // 액션
  setUser: (user: User) =>
    set({
      user,
      isAuthenticated: true,
    }),

  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    set({
      accessToken,
      refreshToken,
    })
  },

  setAccessToken: (accessToken: string) => {
    localStorage.setItem('accessToken', accessToken)
    set({
      accessToken,
    })
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    })
  },

  setLoading: (loading: boolean) =>
    set({
      isLoading: loading,
    }),

  setInitialized: (initialized: boolean) =>
    set({
      isInitialized: initialized,
    }),
})) 