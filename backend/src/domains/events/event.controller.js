import { successResponse, errorResponse } from '../../utils/response.util.js';
import * as eventService from './event.service.js';

export const getEvents = async (req, res) => {
  try {
    const events = await eventService.getActiveEvents();
    return successResponse(
      res,
      { events },
      '진행 중인 이벤트 목록 조회에 성공했습니다.',
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await eventService.getEventById(id);
    return successResponse(res, { event }, '이벤트 상세 조회에 성공했습니다.');
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const participateInEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId; // auth 미들웨어에서 설정된 사용자 ID

    const participation = await eventService.participateInEvent(id, userId);
    return successResponse(
      res,
      { participationId: participation.id },
      '이벤트 참여 신청이 완료되었습니다. 결과를 기다려주세요.',
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getMyParticipations = async (req, res) => {
  try {
    const userId = req.user.userId; // auth 미들웨어에서 설정된 사용자 ID
    const { page = 1, limit = 10 } = req.query;

    const result = await eventService.getMyParticipations(
      userId,
      parseInt(page),
      parseInt(limit),
    );
    return successResponse(
      res,
      result,
      '내 이벤트 참여 내역 조회에 성공했습니다.',
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

/**
 * 이벤트 결과를 발표합니다. (관리자 전용)
 */
export const announceEventResults = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await eventService.announceEventResults(parseInt(id));
    return successResponse(res, result, '이벤트 결과 발표가 완료되었습니다.');
  } catch (error) {
    return errorResponse(res, error);
  }
};

/**
 * 특정 이벤트에 대한 사용자의 참여 상태를 조회합니다.
 */
export const getParticipationStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params; // eventId 대신 id 사용

    const participation = await eventService.getParticipationStatus(
      userId,
      parseInt(id),
    );
    return successResponse(
      res,
      { participation },
      '참여 상태 조회에 성공했습니다.',
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};
