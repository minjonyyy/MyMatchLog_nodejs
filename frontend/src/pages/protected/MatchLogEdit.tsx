import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMatchLog, getTeams, getStadiums, updateMatchLog } from '../../services/matchLogs'
import { parseTicketImage } from '../../services/ocr'
import type { UpdateMatchLogRequest, Team, Stadium, MatchLog } from '../../types/matchLogs'
import type { OcrExtractedInfo } from '../../types/ocr'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { useToast } from '../../hooks/use-toast'

const MatchLogEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [ticketImage, setTicketImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isOcrProcessing, setIsOcrProcessing] = useState(false)
  const [showOcrHelp, setShowOcrHelp] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  


  // 날짜 검증 함수
  const validateDate = (dateString: string | undefined) => {
    if (!dateString) return true
    const selectedDate = new Date(dateString)
    selectedDate.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate > today) {
      return '미래 날짜는 선택할 수 없습니다. 오늘까지의 날짜만 선택해주세요.'
    }
    return true
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<UpdateMatchLogRequest>({
    mode: 'onChange',
    defaultValues: {
      match_date: new Date().toISOString().split('T')[0],
    }
  })

  // 기존 직관 기록 조회
  const { data: matchLogData, isLoading: matchLogLoading, error: matchLogError } = useQuery({
    queryKey: ['matchLog', id],
    queryFn: () => getMatchLog(parseInt(id!)),
    enabled: !!id,
  })

  // 팀 목록 조회
  const { data: teamsData, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
  })

  // 경기장 목록 조회
  const { data: stadiumsData, isLoading: stadiumsLoading } = useQuery({
    queryKey: ['stadiums'],
    queryFn: getStadiums,
  })

  // 직관 기록 수정
  const updateMatchLogMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMatchLogRequest }) => 
      updateMatchLog(id, data),
    onSuccess: () => {
      toast({
        title: "수정 완료",
        description: "직관 기록이 성공적으로 수정되었습니다.",
      })
      queryClient.invalidateQueries({ queryKey: ['matchLogs'] })
      queryClient.invalidateQueries({ queryKey: ['matchLog', id] })
      navigate(`/match-logs/${id}`)
    },
    onError: (error: any) => {
      toast({
        title: "수정 실패",
        description: error.response?.data?.message || "직관 기록 수정에 실패했습니다.",
        variant: "destructive",
      })
    }
  })

  // 기존 데이터를 폼에 설정
  useEffect(() => {
    if (matchLogData?.data.matchLog && teamsData?.data.teams && stadiumsData?.data.stadiums) {
      const matchLog = matchLogData.data.matchLog
      
      // 날짜 형식을 YYYY-MM-DD로 변환 (한국 시간대 고려)
      const date = new Date(matchLog.match_date)
      const koreanDate = new Date(date.getTime() + (9 * 60 * 60 * 1000)) // UTC+9
      const dateOnly = koreanDate.toISOString().split('T')[0]
      
      // 폼 데이터 준비
      const formData = {
        match_date: dateOnly,
        stadium_id: matchLog.stadium.id,
        home_team_id: matchLog.home_team.id,
        away_team_id: matchLog.away_team.id,
        result: matchLog.result,
        memo: matchLog.memo || ''
      }
      
      // reset 함수를 사용하여 폼 전체를 업데이트 (다음 렌더링 사이클에서 실행)
      setTimeout(() => {
        reset(formData)
      }, 0)
      
      // 기존 티켓 이미지 미리보기 설정
      if (matchLog.ticket_image_url) {
        setImagePreview(matchLog.ticket_image_url)
      }
    }
  }, [matchLogData, teamsData, stadiumsData, reset])

  // 이미지 업로드 처리
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setTicketImage(file)
      
      // 이미지 미리보기 생성
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // OCR 처리
  const handleOcrProcess = async () => {
    if (!ticketImage) {
      toast({
        title: "이미지 필요",
        description: "먼저 티켓 이미지를 업로드해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsOcrProcessing(true)
    try {
      const response = await parseTicketImage({ ticket_image: ticketImage })
      
      if (response.success && response.data.extractedInfo) {
        const extractedInfo = response.data.extractedInfo
        
        // 추출된 정보로 폼 필드 채우기
        if (extractedInfo.match_date) {
          const dateValidation = validateDate(extractedInfo.match_date)
          if (dateValidation === true) {
            setValue('match_date', extractedInfo.match_date)
          } else {
            toast({
              title: "OCR 날짜 오류",
              description: "추출된 날짜가 미래 날짜입니다. 수동으로 수정해주세요.",
              variant: "destructive",
            })
          }
        }
        
        // 팀 이름으로 ID 찾기
        if (extractedInfo.home_team && teamsData?.data.teams) {
          const homeTeam = teamsData.data.teams.find(
            team => team.name.includes(extractedInfo.home_team!) || extractedInfo.home_team!.includes(team.name)
          )
          if (homeTeam) setValue('home_team_id', homeTeam.id)
        }
        
        if (extractedInfo.away_team && teamsData?.data.teams) {
          const awayTeam = teamsData.data.teams.find(
            team => team.name.includes(extractedInfo.away_team!) || extractedInfo.away_team!.includes(team.name)
          )
          if (awayTeam) setValue('away_team_id', awayTeam.id)
        }
        
        // 경기장 이름으로 ID 찾기
        if (extractedInfo.stadium && stadiumsData?.data.stadiums) {
          const stadium = stadiumsData.data.stadiums.find(
            s => s.name.includes(extractedInfo.stadium!) || extractedInfo.stadium!.includes(s.name)
          )
          if (stadium) setValue('stadium_id', stadium.id)
        }

        toast({
          title: "OCR 완료!",
          description: `정확도: ${Math.round((extractedInfo.confidence || 0) * 100)}% - 추출된 정보로 폼을 채웠습니다.`,
        })
      }
    } catch (error: any) {
      toast({
        title: "OCR 실패",
        description: error.response?.data?.message || "티켓 정보 추출에 실패했습니다. 수동으로 입력해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsOcrProcessing(false)
    }
  }

  // 폼 제출 처리
  const onSubmit = (data: UpdateMatchLogRequest) => {
    setHasSubmitted(true)
    
    // 날짜 검증
    const dateValidation = validateDate(data.match_date)
    if (dateValidation !== true) {
      toast({
        title: "날짜 오류",
        description: dateValidation,
        variant: "destructive",
      })
      return
    }
    
    // 필수 필드 검증
    if (!data.stadium_id || !data.home_team_id || data.home_team_id === 0 || !data.away_team_id || data.away_team_id === 0) {
      toast({
        title: "필수 정보 누락",
        description: "경기장, 홈팀, 원정팀을 모두 선택해주세요.",
        variant: "destructive",
      })
      return
    }

    // 수정할 데이터 준비 (사용자가 실제로 입력한 값만 사용)
    const updateData: UpdateMatchLogRequest = {}
    
    // 변경된 필드만 포함
    if (data.match_date !== matchLogData?.data.matchLog.match_date) {
      updateData.match_date = data.match_date
    }
    if (data.stadium_id !== matchLogData?.data.matchLog.stadium.id) {
      updateData.stadium_id = data.stadium_id
    }
    if (data.home_team_id !== matchLogData?.data.matchLog.home_team.id) {
      updateData.home_team_id = data.home_team_id
    }
    if (data.away_team_id !== matchLogData?.data.matchLog.away_team.id) {
      updateData.away_team_id = data.away_team_id
    }
    if (data.result !== matchLogData?.data.matchLog.result) {
      updateData.result = data.result
    }
    if (data.memo !== matchLogData?.data.matchLog.memo) {
      updateData.memo = data.memo
    }
    
    // 새 이미지가 있으면 추가
    if (ticketImage) {
      updateData.ticket_image = ticketImage
    }

    // 변경사항이 없으면 경고
    if (Object.keys(updateData).length === 0 && !ticketImage) {
      toast({
        title: "변경사항 없음",
        description: "수정할 내용이 없습니다.",
        variant: "destructive",
      })
      return
    }

    if (id) {
      updateMatchLogMutation.mutate({ id: parseInt(id), data: updateData })
    }
  }

  // 경기장별 홈팀 매핑
  const getHomeTeamsByStadium = (stadiumId: number | undefined) => {
    if (!stadiumId || !teamsData?.data.teams) return []
    
    // 경기장별 홈팀 매핑
    const stadiumHomeTeams: { [key: number]: number[] } = {
      1: [1, 2], // 잠실야구장: LG 트윈스(1), 두산 베어스(2)
      2: [4], // 고척스카이돔: 키움 히어로즈(4)
      3: [3], // 인천SSG랜더스필드: SSG 랜더스(3)
      4: [6], // 광주기아챔피언스필드: KIA 타이거즈(6)
      5: [7], // 사직야구장: 롯데 자이언츠(7)
      6: [8], // 대구삼성라이온즈파크: 삼성 라이온즈(8)
      7: [5], // 창원NC파크: NC 다이노스(5)
      8: [10], // 수원KT위즈파크: kt wiz(10)
      9: [9], // 대전한화생명이글스파크: 한화 이글스(9)
    }
    
    const homeTeamIds = stadiumHomeTeams[stadiumId] || []
    return teamsData.data.teams.filter(team => homeTeamIds.includes(team.id))
  }

  // 현재 선택된 경기장의 홈팀들
  const availableHomeTeams = getHomeTeamsByStadium(watch('stadium_id'))

  if (matchLogLoading || teamsLoading || stadiumsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-stone-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (matchLogError || !matchLogData?.data.matchLog) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-stone-800 mb-4">
            직관 기록 수정
          </h1>
          <p className="text-xl text-stone-600">
            기존 직관 기록을 수정해보세요
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 티켓 이미지 업로드 */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-xl text-stone-800">티켓 이미지</CardTitle>
                <CardDescription>
                  티켓 이미지를 업로드하면 OCR로 자동 정보 추출이 가능합니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 이미지 업로드 */}
                <div>
                  <Label htmlFor="ticket_image" className="text-stone-700 font-medium">
                    티켓 이미지 업로드
                  </Label>
                  <Input
                    id="ticket_image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-2"
                  />
                </div>

                {/* OCR 버튼 */}
                {ticketImage && (
                  <Button
                    onClick={handleOcrProcess}
                    disabled={isOcrProcessing}
                    variant="outline"
                    className="w-full border-amber-700 text-amber-700 hover:bg-amber-50"
                  >
                    {isOcrProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-amber-700 border-t-transparent rounded-full animate-spin mr-2"></div>
                        OCR 처리 중...
                      </>
                    ) : (
                      'OCR로 정보 자동 추출'
                    )}
                  </Button>
                )}

                {/* 이미지 미리보기 */}
                {imagePreview && (
                  <div className="mt-4">
                    <Label className="text-stone-700 font-medium">이미지 미리보기</Label>
                    <div className="mt-2 border-2 border-dashed border-amber-200 rounded-lg p-4">
                      <img
                        src={imagePreview}
                        alt="티켓 미리보기"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* OCR 안내 토글 */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <button
                    onClick={() => setShowOcrHelp(!showOcrHelp)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h4 className="text-sm font-medium text-amber-800">💡 OCR 기능 안내</h4>
                    <span className={`transform transition-transform duration-200 ${showOcrHelp ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  
                  {showOcrHelp && (
                    <ul className="text-xs text-amber-700 space-y-1 mt-2 pt-2 border-t border-amber-200">
                      <li>• 선명하고 깨끗한 티켓 이미지를 사용해주세요.</li>
                      <li>• 티켓 이미지를 업로드하면 자동으로 경기 정보를 추출합니다.</li>
                      <li>• 추출된 정보는 자동으로 폼에 채워집니다.</li>
                      <li>• 정확도가 낮을 수 있으니 확인 후 수정해주세요.</li>
                      <li>• 지원 형식: JPG, PNG, JPEG</li>
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 메인 폼 */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-2xl text-stone-800">경기 정보</CardTitle>
                <CardDescription>
                  경기 정보를 수정해주세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* 경기 날짜 */}
                  <div>
                    <Label htmlFor="match_date" className="text-stone-700 font-medium">
                      경기 날짜 *
                    </Label>
                    <Input
                      id="match_date"
                      type="date"
                      max={new Date().toISOString().split('T')[0]} // 오늘까지만 선택 가능
                      {...register('match_date', { 
                        required: '경기 날짜를 선택해주세요',
                        validate: validateDate
                      })}
                      className={`mt-2 ${errors.match_date ? 'border-red-300' : ''}`}
                    />
                    {errors.match_date && (
                      <p className="text-red-500 text-sm mt-1">{errors.match_date.message}</p>
                    )}
                  </div>

                  {/* 경기장 선택 */}
                  <div>
                    <Label htmlFor="stadium_id" className="text-stone-700 font-medium">
                      경기장 *
                    </Label>
                    {stadiumsLoading ? (
                      <div className="mt-2 p-3 bg-gray-100 rounded-md">
                        <p className="text-gray-500">경기장 정보를 불러오는 중...</p>
                      </div>
                    ) : (
                                              <Select 
                          value={matchLogData?.data.matchLog?.stadium?.id?.toString() || watch('stadium_id')?.toString() || ""}
                          onValueChange={(value) => {
                            const stadiumId = parseInt(value)
                            setValue('stadium_id', stadiumId)
                            // 경기장이 변경되면 홈팀과 원정팀 초기화
                            setValue('home_team_id', 0)
                            setValue('away_team_id', 0)
                          }}
                        >
                        <SelectTrigger className={`mt-2 bg-white ${hasSubmitted && !watch('stadium_id') ? 'border-red-300' : ''}`}>
                          <SelectValue placeholder="경기장을 선택해주세요" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200">
                          {stadiumsData?.data.stadiums.map((stadium: Stadium) => (
                            <SelectItem key={stadium.id} value={stadium.id.toString()} className="hover:bg-amber-50">
                              {stadium.name} ({stadium.city})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {hasSubmitted && !watch('stadium_id') && (
                      <p className="text-red-500 text-sm mt-1">경기장을 선택해주세요</p>
                    )}
                  </div>

                  {/* 팀 선택 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="home_team_id" className="text-stone-700 font-medium">
                        홈팀 *
                      </Label>
                      {teamsLoading ? (
                        <div className="mt-2 p-3 bg-gray-100 rounded-md">
                          <p className="text-gray-500">팀 정보를 불러오는 중...</p>
                        </div>
                      ) : (
                                                 <Select 
                           value={matchLogData?.data.matchLog?.home_team?.id?.toString() || (watch('home_team_id') && watch('home_team_id') !== 0 ? watch('home_team_id')?.toString() || "" : "")}
                           onValueChange={(value) => setValue('home_team_id', parseInt(value))}
                           disabled={!watch('stadium_id')}
                         >
                          <SelectTrigger className={`mt-2 bg-white ${hasSubmitted && (!watch('home_team_id') || watch('home_team_id') === 0) ? 'border-red-300' : ''}`}>
                            <SelectValue placeholder={!watch('stadium_id') ? "먼저 경기장을 선택해주세요" : "홈팀을 선택해주세요"} />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200">
                            {!watch('stadium_id') ? (
                              <SelectItem value="no-stadium" disabled>경기장을 먼저 선택해주세요</SelectItem>
                            ) : availableHomeTeams.length === 0 ? (
                              <SelectItem value="no-teams" disabled>선택 가능한 홈팀이 없습니다</SelectItem>
                            ) : (
                              availableHomeTeams.map((team: Team) => (
                                <SelectItem 
                                  key={team.id} 
                                  value={team.id.toString()}
                                  disabled={watch('away_team_id') === team.id}
                                  className="hover:bg-amber-50"
                                >
                                  {team.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      )}
                      {hasSubmitted && (!watch('home_team_id') || watch('home_team_id') === 0) && (
                        <p className="text-red-500 text-sm mt-1">홈팀을 선택해주세요</p>
                      )}
                      {watch('stadium_id') && availableHomeTeams.length === 0 && (
                        <p className="text-red-500 text-sm mt-1">이 경기장의 홈팀 정보가 없습니다</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="away_team_id" className="text-stone-700 font-medium">
                        원정팀 *
                      </Label>
                      {teamsLoading ? (
                        <div className="mt-2 p-3 bg-gray-100 rounded-md">
                          <p className="text-gray-500">팀 정보를 불러오는 중...</p>
                        </div>
                      ) : (
                                                 <Select 
                           value={matchLogData?.data.matchLog?.away_team?.id?.toString() || (watch('away_team_id') && watch('away_team_id') !== 0 ? watch('away_team_id')?.toString() || "" : "")}
                           onValueChange={(value) => setValue('away_team_id', parseInt(value))}
                           disabled={!watch('home_team_id')}
                         >
                          <SelectTrigger className={`mt-2 bg-white ${hasSubmitted && (!watch('away_team_id') || watch('away_team_id') === 0) ? 'border-red-300' : ''}`}>
                            <SelectValue placeholder={!watch('home_team_id') ? "먼저 홈팀을 선택해주세요" : "원정팀을 선택해주세요"} />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200">
                            {!watch('home_team_id') ? (
                              <SelectItem value="no-home-team" disabled>홈팀을 먼저 선택해주세요</SelectItem>
                            ) : (
                              teamsData?.data.teams.map((team: Team) => (
                                <SelectItem 
                                  key={team.id} 
                                  value={team.id.toString()}
                                  disabled={watch('home_team_id') === team.id}
                                  className="hover:bg-amber-50"
                                >
                                  {team.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      )}
                      {hasSubmitted && (!watch('away_team_id') || watch('away_team_id') === 0) && (
                        <p className="text-red-500 text-sm mt-1">원정팀을 선택해주세요</p>
                      )}
                    </div>
                  </div>

                  {/* 경기 결과 */}
                  <div>
                    <Label htmlFor="result" className="text-stone-700 font-medium">
                      경기 결과
                    </Label>
                    {matchLogData?.data.matchLog ? (
                      <Select 
                        value={watch('result') || ""}
                        onValueChange={(value) => setValue('result', value as 'WIN' | 'LOSS' | 'DRAW' | 'CANCELLED')}
                      >
                        <SelectTrigger className="mt-2 bg-white">
                          <SelectValue placeholder="경기 결과를 선택해주세요 (선택사항)" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200">
                          <SelectItem value="WIN" className="hover:bg-amber-50">승리</SelectItem>
                          <SelectItem value="LOSS" className="hover:bg-amber-50">패배</SelectItem>
                          <SelectItem value="DRAW" className="hover:bg-amber-50">무승부</SelectItem>
                          <SelectItem value="CANCELLED" className="hover:bg-amber-50">경기 취소</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-2 p-3 bg-gray-100 rounded-md">
                        <p className="text-gray-500">데이터를 불러오는 중...</p>
                      </div>
                    )}
                  </div>

                  {/* 메모 */}
                  <div>
                    <Label htmlFor="memo" className="text-stone-700 font-medium">
                      메모
                    </Label>
                    <Textarea
                      id="memo"
                      placeholder="경기에 대한 특별한 기억이나 메모를 남겨보세요..."
                      {...register('memo')}
                      className="mt-2"
                      rows={4}
                    />
                  </div>

                  {/* 제출 버튼 */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting || updateMatchLogMutation.isPending}
                      className="flex-1 bg-amber-700 hover:bg-amber-800 text-white"
                    >
                      {isSubmitting || updateMatchLogMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          수정 중...
                        </>
                      ) : (
                        '직관 기록 수정'
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(`/match-logs/${id}`)}
                      className="border-amber-700 text-amber-700 hover:bg-amber-50"
                    >
                      취소
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MatchLogEdit 