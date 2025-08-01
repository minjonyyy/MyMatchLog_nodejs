import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryProvider } from './providers/QueryProvider'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import './App.css'
import Home from './pages/public/Home'
import Login from './pages/public/Login'
import Signup from './pages/public/Signup'

const Events = () => <div className="p-8">🎉 이벤트 목록 페이지</div>
const EventDetail = () => <div className="p-8">🎉 이벤트 상세 페이지</div>
const MatchLogs = () => <div className="p-8">📊 직관 기록 목록 페이지</div>
const MatchLogCreate = () => <div className="p-8">✍️ 직관 기록 작성 페이지</div>
const MatchLogDetail = () => <div className="p-8">📋 직관 기록 상세 페이지</div>
const MatchLogEdit = () => <div className="p-8">✏️ 직관 기록 수정 페이지</div>
const MyPage = () => <div className="p-8">👤 마이페이지</div>
const Settings = () => <div className="p-8">⚙️ 설정 페이지</div>
const AdminDashboard = () => <div className="p-8">👑 관리자 대시보드</div>
const AdminEvents = () => <div className="p-8">👑 이벤트 관리 페이지</div>
const AdminParticipants = () => <div className="p-8">👑 참여자 관리 페이지</div>
const NotFound = () => <div className="p-8">❌ 404 - 페이지를 찾을 수 없습니다</div>

function App() {
  return (
    <QueryProvider>
      <Router>
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
              <Route path="/match-logs" element={<MatchLogs />} />
              <Route path="/match-logs/create" element={<MatchLogCreate />} />
              <Route path="/match-logs/:id" element={<MatchLogDetail />} />
              <Route path="/match-logs/:id/edit" element={<MatchLogEdit />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/settings" element={<Settings />} />
              
              {/* 관리자 페이지 */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/events/:id/participants" element={<AdminParticipants />} />
              
              {/* 404 페이지 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </QueryProvider>
  )
}

export default App
