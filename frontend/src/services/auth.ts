import api from './api'
import type { LoginRequest, LoginResponse, SignupRequest, TokenRefreshRequest, TokenRefreshResponse, UpdateUserRequest } from '../types/auth'
import type { ApiResponse } from '../types/api'

// 로그인
export const login = async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  const response = await api.post<ApiResponse<LoginResponse>>('/users/login', data)
  return response.data
}

// 회원가입
export const signup = async (data: SignupRequest): Promise<ApiResponse<LoginResponse>> => {
  const response = await api.post<ApiResponse<LoginResponse>>('/users/signup', data)
  return response.data
}

// 토큰 갱신
export const refreshToken = async (data: TokenRefreshRequest): Promise<ApiResponse<TokenRefreshResponse>> => {
  const response = await api.post<ApiResponse<TokenRefreshResponse>>('/users/token', data)
  return response.data
}

// 내 정보 조회
export const getMyInfo = async (): Promise<ApiResponse<any>> => {
  const response = await api.get<ApiResponse<any>>('/users/me')
  return response.data
}

// 내 정보 수정
export const updateMyInfo = async (data: UpdateUserRequest): Promise<ApiResponse<any>> => {
  const response = await api.patch<ApiResponse<any>>('/users/me', data)
  return response.data
} 