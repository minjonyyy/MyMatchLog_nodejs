import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getMatchLogs,
  getMatchLog,
  createMatchLog,
  updateMatchLog,
  deleteMatchLog,
  getTeams,
  getStadiums
} from '../services/matchLogs'
import type {
  MatchLogsQueryParams,
  CreateMatchLogRequest,
  UpdateMatchLogRequest
} from '../types/matchLogs'

// 직관 기록 목록 조회
export const useMatchLogs = (params?: MatchLogsQueryParams) => {
  return useQuery({
    queryKey: ['matchLogs', params],
    queryFn: () => getMatchLogs(params),
    staleTime: 5 * 60 * 1000, // 5분
  })
}

// 직관 기록 상세 조회
export const useMatchLog = (id: number) => {
  return useQuery({
    queryKey: ['matchLog', id],
    queryFn: () => getMatchLog(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5분
  })
}

// 팀 목록 조회
export const useTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
    staleTime: 30 * 60 * 1000, // 30분 (팀 정보는 자주 변경되지 않음)
  })
}

// 경기장 목록 조회
export const useStadiums = () => {
  return useQuery({
    queryKey: ['stadiums'],
    queryFn: getStadiums,
    staleTime: 30 * 60 * 1000, // 30분 (경기장 정보는 자주 변경되지 않음)
  })
}

// 직관 기록 생성
export const useCreateMatchLog = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateMatchLogRequest) => createMatchLog(data),
    onSuccess: () => {
      // 직관 기록 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['matchLogs'] })
    },
  })
}

// 직관 기록 수정
export const useUpdateMatchLog = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMatchLogRequest }) =>
      updateMatchLog(id, data),
    onSuccess: (_, { id }) => {
      // 직관 기록 목록과 상세 정보 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['matchLogs'] })
      queryClient.invalidateQueries({ queryKey: ['matchLog', id] })
    },
  })
}

// 직관 기록 삭제
export const useDeleteMatchLog = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => deleteMatchLog(id),
    onSuccess: () => {
      // 직관 기록 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['matchLogs'] })
    },
  })
} 