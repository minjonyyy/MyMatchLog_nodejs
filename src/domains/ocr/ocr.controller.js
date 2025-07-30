import { successResponse, errorResponse } from '../../utils/response.util.js';
import * as ocrService from './ocr.service.js';

export const parseTicket = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, {
        code: 'COMMON_INVALID_INPUT',
        message: '티켓 이미지 파일이 필요합니다.'
      }, 400);
    }

    const extractedInfo = await ocrService.parseTicketImage(req.file);
    
    if (!extractedInfo) {
      return successResponse(res, { 
        extractedInfo: null,
        error: '티켓 정보를 인식할 수 없습니다.'
      }, 'OCR 처리를 완료했습니다. 정보를 인식할 수 없어 수동 입력이 필요합니다.');
    }
    
    return successResponse(res, { extractedInfo }, '티켓 정보 추출을 완료했습니다.');
  } catch (error) {
    return errorResponse(res, error);
  }
};
