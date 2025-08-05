import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryProvider } from "./providers/QueryProvider";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { Toaster } from "./components/ui/toaster";
import "./App.css";
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import Signup from "./pages/public/Signup";
import { Events } from "./pages/public/Events";
import { EventDetail } from "./pages/public/EventDetail";
import MatchLogsPage from "./pages/protected/MatchLogs";
import MatchLogCreate from "./pages/protected/MatchLogCreate";
import MatchLogDetail from "./pages/protected/MatchLogDetail";
import MatchLogEdit from "./pages/protected/MatchLogEdit";
import MyPage from "./pages/protected/MyPage";
import Settings from "./pages/protected/Settings";
import ProtectedRoute from "./components/features/auth/ProtectedRoute";
import AuthInitializer from "./components/features/auth/AuthInitializer";
const AdminDashboard = () => <div className="p-8">👑 관리자 대시보드</div>;
const AdminEvents = () => <div className="p-8">👑 이벤트 관리 페이지</div>;
const AdminParticipants = () => (
  <div className="p-8">👑 참여자 관리 페이지</div>
);
const NotFound = () => (
  <div className="p-8">❌ 404 - 페이지를 찾을 수 없습니다</div>
);

function App() {
  return (
    <QueryProvider>
      <Router>
        <AuthInitializer />
        <div className="min-h-screen flex flex-col">
          <Header />

          {/* 메인 콘텐츠 */}
          <main className="flex-1">
            <Routes>
              {/* 공개 페이지 */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />

              {/* 인증 필요 페이지 */}
              <Route
                path="/match-logs"
                element={
                  <ProtectedRoute>
                    <MatchLogsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/match-logs/create"
                element={
                  <ProtectedRoute>
                    <MatchLogCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/match-logs/:id"
                element={
                  <ProtectedRoute>
                    <MatchLogDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/match-logs/:id/edit"
                element={
                  <ProtectedRoute>
                    <MatchLogEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mypage"
                element={
                  <ProtectedRoute>
                    <MyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* 관리자 페이지 */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminEvents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events/:id/participants"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminParticipants />
                  </ProtectedRoute>
                }
              />

              {/* 404 페이지 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />
        </div>
        <Toaster />
      </Router>
    </QueryProvider>
  );
}

export default App;
