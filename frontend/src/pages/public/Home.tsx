import React from 'react'
import { Link } from 'react-router-dom'

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* 메인 타이틀 */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="text-stone-800">야구 직관 기록의</span>
              <br />
              <span className="text-amber-800">새로운 시작</span>
            </h1>
            
            {/* 서브 타이틀 */}
            <p className="text-xl md:text-2xl text-stone-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              MyMatchLog와 함께 야구장에서의 특별한 순간들을 기록하고, 
              <br className="hidden md:block" />
              다양한 이벤트에 참여해보세요.
            </p>
            
            {/* CTA 버튼들 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                to="/match-logs/create"
                className="px-8 py-4 bg-amber-700 text-white rounded-xl font-semibold text-lg hover:bg-amber-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                직관 기록 시작하기
              </Link>
              
              <Link 
                to="/events"
                className="px-8 py-4 bg-white text-amber-800 rounded-xl font-semibold text-lg border-2 border-amber-700 hover:bg-amber-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                이벤트 둘러보기
              </Link>
            </div>
            
            {/* 통계 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-800 mb-2">1,234</div>
                <div className="text-stone-600">등록된 직관 기록</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-800 mb-2">567</div>
                <div className="text-stone-600">진행 중인 이벤트</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-800 mb-2">890</div>
                <div className="text-stone-600">활성 사용자</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              주요 기능
            </h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              야구 팬을 위한 특별한 기능들을 만나보세요
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* 직관 기록 기능 */}
            <div className="text-center p-8 rounded-2xl bg-amber-50 hover:bg-amber-100 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-stone-900">직관 기록</h3>
              <p className="text-stone-600 leading-relaxed">
                티켓 OCR을 통한 자동 정보 추출과 함께 
                야구장에서의 특별한 순간을 기록하세요.
              </p>
            </div>
            
            {/* 이벤트 참여 기능 */}
            <div className="text-center p-8 rounded-2xl bg-stone-50 hover:bg-stone-100 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🎉</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-stone-900">이벤트 참여</h3>
              <p className="text-stone-600 leading-relaxed">
                다양한 야구 이벤트에 참여하고 
                다른 팬들과 소통해보세요.
              </p>
            </div>
            
            {/* 통계 분석 기능 */}
            <div className="text-center p-8 rounded-2xl bg-yellow-50 hover:bg-yellow-100 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-stone-900">통계 분석</h3>
              <p className="text-stone-600 leading-relaxed">
                나만의 직관 통계를 확인하고 
                야구 팬으로서의 여정을 추적하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Events Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              최근 이벤트
            </h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              지금 진행 중인 특별한 이벤트들을 확인해보세요
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 진행중인 이벤트 */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-amber-500 to-amber-600 relative">
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                    진행중
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-stone-900">
                  2024 시즌 첫 직관 이벤트
                </h3>
                <p className="text-stone-600 mb-4 leading-relaxed">
                  새로운 시즌을 맞아 첫 직관을 기록해보세요! 
                  특별한 기념품도 준비되어 있어요.
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-stone-500">2024.03.15 - 2024.04.15</div>
                  <button className="text-amber-800 font-semibold hover:text-amber-900 transition-colors duration-300">
                    자세히 보기 →
                  </button>
                </div>
              </div>
            </div>
            
            {/* 모집중인 이벤트 */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-stone-500 to-stone-600 relative">
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                    모집중
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-stone-900">
                  홈런왕 예측 이벤트
                </h3>
                <p className="text-stone-600 mb-4 leading-relaxed">
                  올해 홈런왕을 예측하고 상품을 받아보세요! 
                  정확한 예측자에게는 특별한 상품이!
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-stone-500">2024.03.01 - 2024.03.31</div>
                  <button className="text-amber-800 font-semibold hover:text-amber-900 transition-colors duration-300">
                    자세히 보기 →
                  </button>
                </div>
              </div>
            </div>
            
            {/* 종료된 이벤트 */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden opacity-75">
              <div className="h-48 bg-gradient-to-br from-gray-500 to-gray-600 relative">
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                    종료
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-stone-900">
                  2023 시즌 총결산
                </h3>
                <p className="text-stone-600 mb-4 leading-relaxed">
                  2023년 한 해 동안의 직관 기록을 정리해보세요. 
                  특별한 기념품도 준비되어 있어요.
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-stone-500">2023.12.01 - 2023.12.31</div>
                  <button className="text-amber-800 font-semibold hover:text-amber-900 transition-colors duration-300">
                    결과 보기 →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-50 to-stone-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-6">
            지금 바로 시작해보세요!
          </h2>
          <p className="text-xl text-stone-600 mb-8">
            야구장에서의 특별한 순간들을 기록하고, 
            다른 팬들과 함께 소통해보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup"
              className="px-8 py-4 bg-amber-700 text-white rounded-xl font-semibold text-lg hover:bg-amber-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              무료 회원가입
            </Link>
            <Link 
              to="/login"
              className="px-8 py-4 bg-white text-amber-800 rounded-xl font-semibold text-lg border-2 border-amber-700 hover:bg-amber-50 transition-all duration-300 transform hover:scale-105"
            >
              로그인
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home 