import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback } from '../ui/avatar'

const Header: React.FC = () => {
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    // localStorage에서 토큰 제거
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    // 홈으로 이동
    window.location.href = '/'
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 로고 */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">MyMatchLog</span>
            </Link>
          </div>

          {/* 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-amber-800 bg-amber-50'
                  : 'text-gray-700 hover:text-amber-800 hover:bg-amber-50'
              }`}
            >
              홈
            </Link>
            <Link
              to="/events"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/events')
                  ? 'text-amber-800 bg-amber-50'
                  : 'text-gray-700 hover:text-amber-800 hover:bg-amber-50'
              }`}
            >
              이벤트
            </Link>
            {isAuthenticated && (
              <Link
                to="/match-logs"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/match-logs')
                    ? 'text-amber-800 bg-amber-50'
                    : 'text-gray-700 hover:text-amber-800 hover:bg-amber-50'
                }`}
              >
                직관기록
              </Link>
            )}
          </nav>

          {/* 사용자 메뉴 */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/mypage">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-amber-100 text-amber-800">
                      {user?.nickname?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-amber-800"
                >
                  로그아웃
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    로그인
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                    회원가입
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 