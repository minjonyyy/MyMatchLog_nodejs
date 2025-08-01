import api from './api'
import type {
  MatchLogsResponse,
  MatchLogResponse,
  CreateMatchLogRequest,
  UpdateMatchLogRequest,
  MatchLogsQueryParams,
  Team,
  Stadium
} from '../types/matchLogs'

// 직관 기록 목록 조회
export const getMatchLogs = async (params?: MatchLogsQueryParams): Promise<MatchLogsResponse> => {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.append('page', params.page.toString())
  if (params?.limit) searchParams.append('limit', params.limit.toString())
  
  const response = await api.get(`/match-logs?${searchParams.toString()}`)
  return response.data
}

// 직관 기록 상세 조회
export const getMatchLog = async (id: number): Promise<MatchLogResponse> => {
  const response = await api.get(`/match-logs/${id}`)
  return response.data
}

// 직관 기록 생성
export const createMatchLog = async (data: CreateMatchLogRequest): Promise<{ success: boolean; data: { matchLogId: number }; message: string }> => {
  const formData = new FormData()
  formData.append('match_date', data.match_date)
  formData.append('stadium_id', data.stadium_id.toString())
  formData.append('home_team_id', data.home_team_id.toString())
  formData.append('away_team_id', data.away_team_id.toString())
  
  if (data.result) formData.append('result', data.result)
  if (data.memo) formData.append('memo', data.memo)
  if (data.ticket_image) formData.append('ticket_image', data.ticket_image)
  
  const response = await api.post('/match-logs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// 직관 기록 수정
export const updateMatchLog = async (id: number, data: UpdateMatchLogRequest): Promise<{ success: boolean; message: string }> => {
  const formData = new FormData()
  
  if (data.match_date) formData.append('match_date', data.match_date)
  if (data.stadium_id) formData.append('stadium_id', data.stadium_id.toString())
  if (data.home_team_id) formData.append('home_team_id', data.home_team_id.toString())
  if (data.away_team_id) formData.append('away_team_id', data.away_team_id.toString())
  if (data.result) formData.append('result', data.result)
  if (data.memo) formData.append('memo', data.memo)
  if (data.ticket_image) formData.append('ticket_image', data.ticket_image)
  
  const response = await api.patch(`/match-logs/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// 직관 기록 삭제
export const deleteMatchLog = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/match-logs/${id}`)
  return response.data
}

// 팀 목록 조회
export const getTeams = async (): Promise<{ success: boolean; data: { teams: Team[] }; message: string }> => {
  const response = await api.get('/teams')
  return response.data
}

// 경기장 목록 조회
export const getStadiums = async (): Promise<{ success: boolean; data: { stadiums: Stadium[] }; message: string }> => {
  const response = await api.get('/stadiums')
  return response.data
} 