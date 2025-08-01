// 사용자 정보 타입
export interface User {
  id: number
  email: string
  nickname: string
  favoriteTeamId?: number
  favoriteTeamName?: string
  role?: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}

// 로그인 요청 타입
export interface LoginRequest {
  email: string
  password: string
}

// 로그인 응답 타입
export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

// 회원가입 요청 타입
export interface SignupRequest {
  email: string
  password: string
  nickname: string
  favoriteTeamId?: number
}

// 토큰 갱신 요청 타입
export interface TokenRefreshRequest {
  refreshToken: string
}

// 토큰 갱신 응답 타입
export interface TokenRefreshResponse {
  accessToken: string
}

// 사용자 정보 수정 요청 타입
export interface UpdateUserRequest {
  nickname?: string
  favoriteTeamId?: number
} 