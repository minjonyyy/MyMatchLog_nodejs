export interface OcrExtractedInfo {
  match_date?: string
  stadium?: string
  home_team?: string
  away_team?: string
  confidence?: number
}

export interface OcrResponse {
  success: boolean
  data: {
    extractedInfo: OcrExtractedInfo
  }
  message: string
}

export interface OcrRequest {
  ticket_image: File
} 