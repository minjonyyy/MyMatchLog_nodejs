import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { useMatchLogs, useTeams } from '../../hooks/useMatchLogs'
import type { MatchLog } from '../../types/matchLogs'

const MatchLogs: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTeam, setSelectedTeam] = useState<string>('all')
  
  const { data: matchLogsData, isLoading, error } = useMatchLogs({ page: currentPage, limit: 10 })
  const { data: teamsData } = useTeams()
  
  const matchLogs = matchLogsData?.data.matchLogs || []
  const pagination = matchLogsData?.data.pagination
  const teams = teamsData?.data.teams || []

  // 결과 텍스트 변환
  const getResultText = (result: string) => {
    switch (result) {
      case 'WIN': return '승리'
      case 'LOSS': return '패배'
      case 'DRAW': return '무승부'
      default: return result
    }
  }

  // 결과 배지 색상
  const getResultBadgeColor = (result: string) => {
    switch (result) {
      case 'WIN': return 'bg-green-100 text-green-800'
      case 'LOSS': return 'bg-red-100 text-red-800'
      case 'DRAW': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // 검색 및 필터링
  const filteredMatchLogs = matchLogs.filter((matchLog: MatchLog) => {
    const matchesSearch = !searchTerm || 
      matchLog.home_team.name.includes(searchTerm) ||
      matchLog.away_team.name.includes(searchTerm) ||
      matchLog.stadium.name.includes(searchTerm) ||
      (matchLog.memo && matchLog.memo.includes(searchTerm))
    
    const matchesTeam = selectedTeam === 'all' || !selectedTeam || 
      matchLog.home_team.id.toString() === selectedTeam ||
      matchLog.away_team.id.toString() === selectedTeam
    
    return matchesSearch && matchesTeam
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">오류가 발생했습니다</h2>
            <p className="text-stone-600 mb-4">직관 기록을 불러오는 중 문제가 발생했습니다.</p>
            <Button onClick={() => window.location.reload()} className="bg-amber-700 hover:bg-amber-800">
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100">
      <div className="container mx-auto px-4 py-12">
        {/* 헤더 섹션 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-stone-900 mb-4">
            내 직관 기록
          </h1>
          <p className="text-xl text-stone-600 mb-8">
            야구장에서의 특별한 순간들을 기록해보세요
          </p>
          
          {/* 새 기록 작성 버튼 */}
          <Link to="/match-logs/create">
            <Button className="bg-amber-700 hover:bg-amber-800 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              + 새 기록 작성
            </Button>
          </Link>
        </div>

        {/* 필터 및 검색 섹션 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* 왼쪽: 검색 및 필터 그룹 */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* 검색 */}
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium text-stone-700">검색</label>
                <Input
                  placeholder="팀명, 경기장, 메모로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border-gray-300"
                />
              </div>
              
              {/* 팀 필터 */}
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium text-stone-700">응원팀</label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="모든 팀" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200">
                    <SelectItem value="all" className="hover:bg-amber-50">모든 팀</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()} className="hover:bg-amber-50">
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* 오른쪽: 통계 */}
            <div className="space-y-2 text-center md:text-right">
              <label className="text-sm font-medium text-stone-700">총 기록</label>
              <div className="text-2xl font-bold text-amber-700">
                {pagination?.totalCount || 0}개
              </div>
            </div>
          </div>
        </div>

        {/* 직관 기록 목록 */}
        {filteredMatchLogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚾</span>
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-4">아직 직관 기록이 없습니다</h3>
            <p className="text-stone-600 mb-8">
              첫 번째 야구 직관을 기록해보세요!
            </p>
            <Link to="/match-logs/create">
              <Button className="bg-amber-700 hover:bg-amber-800">
                첫 기록 작성하기
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredMatchLogs.map((matchLog) => (
              <Card key={matchLog.id} className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-2xl overflow-hidden">
                {/* 티켓 이미지 */}
                {matchLog.ticket_image_url && (
                  <div className="h-48 bg-gradient-to-br from-amber-100 to-stone-100 relative overflow-hidden">
                    <img
                      src={matchLog.ticket_image_url}
                      alt="티켓 이미지"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getResultBadgeColor(matchLog.result)}`}>
                        {getResultText(matchLog.result)}
                      </span>
                    </div>
                  </div>
                )}
                
                <CardContent className="p-6">
                  {/* 경기 정보 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-stone-500">{formatDate(matchLog.match_date)}</span>
                      {!matchLog.ticket_image_url && (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getResultBadgeColor(matchLog.result)}`}>
                          {getResultText(matchLog.result)}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-center mb-3">
                      <div className="flex items-center justify-center space-x-4">
                        <div className="text-center">
                          <div className="font-bold text-lg text-stone-900">{matchLog.home_team.name}</div>
                          <div className="text-sm text-stone-500">홈팀</div>
                        </div>
                        <div className="text-2xl font-bold text-amber-600">VS</div>
                        <div className="text-center">
                          <div className="font-bold text-lg text-stone-900">{matchLog.away_team.name}</div>
                          <div className="text-sm text-stone-500">원정팀</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center text-sm text-stone-600">
                      📍 {matchLog.stadium.name} ({matchLog.stadium.city})
                    </div>
                  </div>
                  
                  {/* 메모 */}
                  {matchLog.memo && (
                    <div className="mb-4 p-3 bg-amber-50 rounded-lg">
                      <p className="text-sm text-stone-700">{matchLog.memo}</p>
                    </div>
                  )}
                  
                  {/* 액션 버튼 */}
                  <div className="flex space-x-2">
                    <Link to={`/match-logs/${matchLog.id}`} className="flex-1">
                      <Button variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50">
                        상세보기
                      </Button>
                    </Link>
                    <Link to={`/match-logs/${matchLog.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full border-stone-300 text-stone-700 hover:bg-stone-50">
                        수정
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              이전
            </Button>
            
            <div className="flex space-x-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className={page === currentPage 
                    ? "bg-amber-700 hover:bg-amber-800" 
                    : "border-amber-300 text-amber-700 hover:bg-amber-50"
                  }
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              다음
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MatchLogs 