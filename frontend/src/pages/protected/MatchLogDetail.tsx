import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMatchLog, deleteMatchLog } from '../../services/matchLogs'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { useToast } from '../../hooks/use-toast'
import type { MatchLog } from '../../types/matchLogs'

const MatchLogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // 직관 기록 상세 조회
  const { data: matchLogData, isLoading, error } = useQuery({
    queryKey: ['matchLog', id],
    queryFn: () => getMatchLog(parseInt(id!)),
    enabled: !!id,
  })

  // 직관 기록 삭제
  const deleteMatchLogMutation = useMutation({
    mutationFn: deleteMatchLog,
    onSuccess: () => {
      toast({
        title: "삭제 완료",
        description: "직관 기록이 성공적으로 삭제되었습니다.",
      })
      queryClient.invalidateQueries({ queryKey: ['matchLogs'] })
      navigate('/match-logs')
    },
    onError: (error: any) => {
      toast({
        title: "삭제 실패",
        description: error.response?.data?.message || "직관 기록 삭제에 실패했습니다.",
        variant: "destructive",
      })
    }
  })

  const handleDelete = () => {
    if (id) {
      deleteMatchLogMutation.mutate(parseInt(id))
      setIsDeleteDialogOpen(false)
    }
  }

  const handleEdit = () => {
    navigate(`/match-logs/${id}/edit`)
  }

  const getResultText = (result: string) => {
    switch (result) {
      case 'WIN': return '승리'
      case 'LOSS': return '패배'
      case 'DRAW': return '무승부'
      case 'CANCELLED': return '경기 취소'
      default: return '미정'
    }
  }

  const getResultColor = (result: string) => {
    switch (result) {
      case 'WIN': return 'bg-green-100 text-green-800'
      case 'LOSS': return 'bg-red-100 text-red-800'
      case 'DRAW': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-stone-600">직관 기록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !matchLogData?.data.matchLog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-stone-800 mb-4">직관 기록을 찾을 수 없습니다</h1>
            <p className="text-stone-600 mb-6">요청하신 직관 기록이 존재하지 않거나 삭제되었을 수 있습니다.</p>
            <Button onClick={() => navigate('/match-logs')} className="bg-amber-700 hover:bg-amber-800">
              목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const matchLog: MatchLog = matchLogData.data.matchLog

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-stone-800 mb-2">
              직관 기록 상세
            </h1>
            <p className="text-xl text-stone-600">
              {matchLog.match_date} • {matchLog.stadium.name}
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleEdit}
              variant="outline"
              className="border-amber-700 text-amber-700 hover:bg-amber-50"
            >
              수정
            </Button>
            
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                  삭제
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>직관 기록 삭제</DialogTitle>
                  <DialogDescription>
                    이 직관 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleDelete}
                    disabled={deleteMatchLogMutation.isPending}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deleteMatchLogMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        삭제 중...
                      </>
                    ) : (
                      '삭제'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 메인 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 경기 정보 */}
            <Card className="shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-2xl text-stone-800">경기 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-stone-600 mb-1">경기 날짜</p>
                    <p className="text-lg text-stone-800">{matchLog.match_date}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-600 mb-1">경기장</p>
                    <p className="text-lg text-stone-800">{matchLog.stadium.name} ({matchLog.stadium.city})</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-stone-600 mb-1">홈팀</p>
                    <p className="text-lg text-stone-800">{matchLog.home_team.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-600 mb-1">원정팀</p>
                    <p className="text-lg text-stone-800">{matchLog.away_team.name}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-stone-600 mb-1">경기 결과</p>
                  <Badge className={getResultColor(matchLog.result)}>
                    {getResultText(matchLog.result)}
                  </Badge>
                </div>

                {matchLog.memo && (
                  <div>
                    <p className="text-sm font-medium text-stone-600 mb-1">메모</p>
                    <p className="text-stone-800 whitespace-pre-wrap">{matchLog.memo}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 티켓 이미지 */}
            {matchLog.ticket_image_url && (
              <Card className="shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-xl text-stone-800">티켓 이미지</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-amber-200 rounded-lg p-4">
                    <img
                      src={matchLog.ticket_image_url}
                      alt="티켓 이미지"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 기록 정보 */}
            <Card className="shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-xl text-stone-800">기록 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-stone-600 mb-1">작성일</p>
                  <p className="text-stone-800">{new Date(matchLog.created_at).toLocaleDateString('ko-KR')}</p>
                </div>
                {matchLog.updated_at !== matchLog.created_at && (
                  <div>
                    <p className="text-sm font-medium text-stone-600 mb-1">수정일</p>
                    <p className="text-stone-800">{new Date(matchLog.updated_at).toLocaleDateString('ko-KR')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 액션 버튼 */}
            <Card className="shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-xl text-stone-800">액션</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => navigate('/match-logs')}
                  variant="outline"
                  className="w-full border-amber-700 text-amber-700 hover:bg-amber-50"
                >
                  목록으로 돌아가기
                </Button>
                <Button
                  onClick={() => navigate('/match-logs/create')}
                  className="w-full bg-amber-700 hover:bg-amber-800"
                >
                  새 기록 작성
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MatchLogDetail 