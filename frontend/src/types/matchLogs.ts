export interface Team {
  id: number
  name: string
  logo_url?: string
  stadium?: {
    id: number
    name: string
    city: string
  }
}

export interface Stadium {
  id: number
  name: string
  city: string
  capacity: number
  created_at: string
  updated_at: string
}

export interface MatchLog {
  id: number
  user_id?: number
  match_date: string
  home_team: Team
  away_team: Team
  stadium: Stadium
  result: 'WIN' | 'LOSS' | 'DRAW' | 'CANCELLED'
  memo?: string
  ticket_image_url?: string
  created_at: string
  updated_at: string
}

export interface PaginationMeta {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPrevPage: boolean
  limit: number
}

export interface MatchLogsResponse {
  success: boolean
  data: {
    matchLogs: MatchLog[]
    pagination: PaginationMeta
  }
  message: string
}

export interface MatchLogResponse {
  success: boolean
  data: {
    matchLog: MatchLog
  }
  message: string
}

export interface CreateMatchLogRequest {
  match_date: string
  stadium_id: number
  home_team_id: number
  away_team_id: number
  result?: 'WIN' | 'LOSS' | 'DRAW' | 'CANCELLED'
  memo?: string
  ticket_image?: File
}

export interface UpdateMatchLogRequest {
  match_date?: string
  stadium_id?: number
  home_team_id?: number
  away_team_id?: number
  result?: 'WIN' | 'LOSS' | 'DRAW' | 'CANCELLED'
  memo?: string
  ticket_image?: File
}

export interface MatchLogsQueryParams {
  page?: number
  limit?: number
} 