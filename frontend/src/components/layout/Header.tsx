import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { getMyInfo } from "../../services/auth";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useQuery } from "@tanstack/react-query";

const Header: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout: logoutStore } = useAuthStore();

  // 사용자 정보 조회
  const { data: userInfo } = useQuery({
    queryKey: ["userInfo"],
    queryFn: getMyInfo,
    enabled: !!isAuthenticated,
  });

  const handleLogout = async () => {
    try {
      // authStore의 logout 함수가 백엔드 API도 호출하므로 여기서는 단순히 호출만
      await logoutStore();
      window.location.href = "/";
    } catch (error) {
      console.error("로그아웃 실패:", error);
      // 에러가 발생해도 홈으로 이동
      window.location.href = "/";
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

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
              <span className="text-xl font-bold text-gray-900">
                MyMatchLog
              </span>
            </Link>
          </div>

          {/* 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/")
                  ? "text-amber-800 bg-amber-50"
                  : "text-gray-700 hover:text-amber-800 hover:bg-amber-50"
              }`}
            >
              홈
            </Link>
            <Link
              to="/events"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/events")
                  ? "text-amber-800 bg-amber-50"
                  : "text-gray-700 hover:text-amber-800 hover:bg-amber-50"
              }`}
            >
              이벤트
            </Link>
            {isAuthenticated && (
              <Link
                to="/match-logs"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/match-logs")
                    ? "text-amber-800 bg-amber-50"
                    : "text-gray-700 hover:text-amber-800 hover:bg-amber-50"
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
                {/* 관리자 메뉴 */}
                {userInfo?.data?.user?.is_admin && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive("/admin")
                        ? "text-amber-800 bg-amber-50"
                        : "text-gray-700 hover:text-amber-800 hover:bg-amber-50"
                    }`}
                  >
                    👑 관리자
                  </Link>
                )}
                <Link to="/mypage">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-amber-100 text-amber-800">
                      {(() => {
                        const nickname =
                          userInfo?.data?.user?.nickname || user?.nickname;
                        if (nickname && nickname.length > 0) {
                          return nickname.charAt(0).toUpperCase();
                        }
                        return "U";
                      })()}
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
  );
};

export default Header;
