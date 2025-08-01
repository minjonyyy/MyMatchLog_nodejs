import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../../stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  requireAdmin = false 
}) => {
  const { isAuthenticated, user, isInitialized, accessToken } = useAuthStore()
  const location = useLocation()

  // 토큰이 없고 초기화가 완료된 경우 즉시 로그인 페이지로
  if (requireAuth && isInitialized && !accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 토큰이 있지만 초기화가 완료되지 않은 경우에만 로딩 표시
  if (requireAuth && accessToken && !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            {/* 메인 스피너 */}
            <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-700 rounded-full animate-spin mx-auto mb-4"></div>
            
            {/* 내부 작은 스피너 */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin"></div>
          </div>
          
          {/* 로딩 텍스트 */}
          <div className="text-stone-600 font-medium">
            <div className="text-lg mb-2">인증 상태 확인 중...</div>
            <div className="text-sm">잠시만 기다려주세요</div>
          </div>
        </div>
      </div>
    )
  }

  // 초기화가 완료되었지만 인증이 필요한 페이지인데 로그인하지 않은 경우
  if (requireAuth && isInitialized && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 관리자 권한이 필요한 페이지인데 관리자가 아닌 경우
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute 