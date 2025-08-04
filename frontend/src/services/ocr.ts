import api from './api'
import type { OcrResponse, OcrRequest } from '../types/ocr'

// 티켓 OCR 정보 추출
export const parseTicketImage = async (data: OcrRequest): Promise<OcrResponse> => {
  const formData = new FormData()
  formData.append('ticket_image', data.ticket_image)
  
  const response = await api.post('/ocr/parse-ticket', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
} 