// 공통 응답 타입
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
}

// 페이지네이션 타입
export interface PaginationMeta {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: PaginationMeta
}

// 에러 타입
export interface ApiError {
  success: false
  message: string
  error?: {
    code: string
    details?: any
  }
} 