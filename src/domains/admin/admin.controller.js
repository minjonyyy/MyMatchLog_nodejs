import { successResponse, errorResponse } from '../../utils/response.util.js';
import * as adminService from './admin.service.js';

export const createEvent = async (req, res) => {
  try {
    const eventData = req.body;
    const event = await adminService.createEvent(eventData);
    return successResponse(res, { event }, '이벤트가 성공적으로 생성되었습니다.');
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getEventParticipants = async (req, res) => {
  try {
    const { id } = req.params;
    const participants = await adminService.getEventParticipants(id);
    return successResponse(res, { participants }, '이벤트 참여자 목록 조회에 성공했습니다.');
  } catch (error) {
    return errorResponse(res, error);
  }
}; 