import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getTeams, getStadiums } from '../../services/matchLogs'
import { useCreateMatchLog } from '../../hooks/useMatchLogs'
import { parseTicketImage } from '../../services/ocr'
import type { CreateMatchLogRequest, Team, Stadium } from '../../types/matchLogs'
import type { OcrExtractedInfo } from '../../types/ocr'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { useToast } from '../../hooks/use-toast'

const MatchLogCreate: React.FC = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [ticketImage, setTicketImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isOcrProcessing, setIsOcrProcessing] = useState(false)
  const [showOcrHelp, setShowOcrHelp] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // 날짜 검증 함수
  const validateDate = (dateString: string) => {
    const selectedDate = new Date(dateString)
    selectedDate.setHours(0, 0, 0, 0) // 선택된 날짜도 시간을 00:00:00으로 설정
    const today = new Date()
    today.setHours(0, 0, 0, 0) // 시간을 00:00:00으로 설정
    
    
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
    formState: { errors, isSubmitting }
  } = useForm<CreateMatchLogRequest>({
    defaultValues: {
      match_date: new Date().toISOString().split('T')[0], // 오늘 날짜를 기본값으로
    }
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

  // 직관 기록 생성
  const createMatchLogMutation = useCreateMatchLog()

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
  const onSubmit = (data: CreateMatchLogRequest) => {
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

    if (ticketImage) {
      data.ticket_image = ticketImage
    }
    
    createMatchLogMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: "성공!",
          description: "직관 기록이 성공적으로 등록되었습니다.",
        })
        navigate('/match-logs')
      },
      onError: (error: any) => {
        toast({
          title: "오류 발생",
          description: error.response?.data?.message || "직관 기록 등록에 실패했습니다.",
          variant: "destructive",
        })
      }
    })
  }

  const watchedHomeTeam = watch('home_team_id')
  const watchedAwayTeam = watch('away_team_id')
  const watchedStadium = watch('stadium_id')

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
  const availableHomeTeams = getHomeTeamsByStadium(watchedStadium)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-stone-800 mb-4">
            새로운 직관 기록 작성
          </h1>
          <p className="text-xl text-stone-600">
            야구장에서의 특별한 순간을 기록해보세요
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 메인 폼 */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-2xl text-stone-800">경기 정보</CardTitle>
                <CardDescription>
                  경기 정보를 입력하고 티켓 이미지를 업로드해주세요
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
                    <Select 
                      value={watchedStadium ? watchedStadium.toString() : ""}
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
                        {stadiumsLoading ? (
                          <SelectItem value="loading" disabled>로딩 중...</SelectItem>
                        ) : (
                          stadiumsData?.data.stadiums.map((stadium: Stadium) => (
                            <SelectItem key={stadium.id} value={stadium.id.toString()} className="hover:bg-amber-50">
                              {stadium.name} ({stadium.city})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
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
                       <Select 
                         value={watchedHomeTeam && watchedHomeTeam !== 0 ? watchedHomeTeam.toString() : ""}
                         onValueChange={(value) => setValue('home_team_id', parseInt(value))}
                         disabled={!watchedStadium}
                       >
                         <SelectTrigger className={`mt-2 bg-white ${hasSubmitted && (!watch('home_team_id') || watch('home_team_id') === 0) ? 'border-red-300' : ''}`}>
                           <SelectValue placeholder={!watchedStadium ? "먼저 경기장을 선택해주세요" : "홈팀을 선택해주세요"} />
                         </SelectTrigger>
                         <SelectContent className="bg-white border border-gray-200">
                           {teamsLoading ? (
                             <SelectItem value="loading" disabled>로딩 중...</SelectItem>
                           ) : !watchedStadium ? (
                             <SelectItem value="no-stadium" disabled>경기장을 먼저 선택해주세요</SelectItem>
                           ) : availableHomeTeams.length === 0 ? (
                             <SelectItem value="no-teams" disabled>선택 가능한 홈팀이 없습니다</SelectItem>
                           ) : (
                             availableHomeTeams.map((team: Team) => (
                               <SelectItem 
                                 key={team.id} 
                                 value={team.id.toString()}
                                 disabled={watchedAwayTeam === team.id}
                                 className="hover:bg-amber-50"
                               >
                                 {team.name}
                               </SelectItem>
                             ))
                           )}
                         </SelectContent>
                       </Select>
                       {hasSubmitted && (!watch('home_team_id') || watch('home_team_id') === 0) && (
                         <p className="text-red-500 text-sm mt-1">홈팀을 선택해주세요</p>
                       )}
                       {watchedStadium && availableHomeTeams.length === 0 && (
                         <p className="text-red-500 text-sm mt-1">이 경기장의 홈팀 정보가 없습니다</p>
                       )}
                     </div>

                                         <div>
                       <Label htmlFor="away_team_id" className="text-stone-700 font-medium">
                         원정팀 *
                       </Label>
                       <Select 
                         value={watchedAwayTeam && watchedAwayTeam !== 0 ? watchedAwayTeam.toString() : ""}
                         onValueChange={(value) => setValue('away_team_id', parseInt(value))}
                         disabled={!watchedHomeTeam}
                       >
                         <SelectTrigger className={`mt-2 bg-white ${hasSubmitted && (!watch('away_team_id') || watch('away_team_id') === 0) ? 'border-red-300' : ''}`}>
                           <SelectValue placeholder={!watchedHomeTeam ? "먼저 홈팀을 선택해주세요" : "원정팀을 선택해주세요"} />
                         </SelectTrigger>
                         <SelectContent className="bg-white border border-gray-200">
                           {teamsLoading ? (
                             <SelectItem value="loading" disabled>로딩 중...</SelectItem>
                           ) : !watchedHomeTeam ? (
                             <SelectItem value="no-home-team" disabled>홈팀을 먼저 선택해주세요</SelectItem>
                           ) : (
                             teamsData?.data.teams.map((team: Team) => (
                               <SelectItem 
                                 key={team.id} 
                                 value={team.id.toString()}
                                 disabled={watchedHomeTeam === team.id}
                                 className="hover:bg-amber-50"
                               >
                                 {team.name}
                               </SelectItem>
                             ))
                           )}
                         </SelectContent>
                       </Select>
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
                                         <Select onValueChange={(value) => setValue('result', value as 'WIN' | 'LOSS' | 'DRAW' | 'CANCELLED')}>
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
                      disabled={isSubmitting || createMatchLogMutation.isPending}
                      className="flex-1 bg-amber-700 hover:bg-amber-800 text-white"
                    >
                      {isSubmitting || createMatchLogMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          등록 중...
                        </>
                      ) : (
                        '직관 기록 등록'
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/match-logs')}
                      className="border-amber-700 text-amber-700 hover:bg-amber-50"
                    >
                      취소
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 - 티켓 이미지 업로드 */}
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
                      <li>• 티켓 이미지를 업로드하면 자동으로 경기 정보를 추출합니다</li>
                      <li>• 추출된 정보는 자동으로 폼에 채워집니다</li>
                      <li>• 정확도가 낮을 수 있으니 확인 후 수정해주세요</li>
                      <li>• 지원 형식: JPG, PNG, JPEG</li>
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MatchLogCreate 