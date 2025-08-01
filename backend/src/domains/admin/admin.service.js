import { BadRequestError, NotFoundError } from '../../errors/http.error.js';
import * as adminRepository from './admin.repository.js';

/**
 * 새로운 이벤트를 생성합니다.
 * @param {Object} eventData - 이벤트 데이터
 * @returns {Object} 생성된 이벤트 정보
 */
export const createEvent = async (eventData) => {
  const { title, description, start_at, end_at, gift, capacity } = eventData;

  // 필수 필드 검증
  if (!title || !description || !start_at || !end_at || !gift || !capacity) {
    throw new BadRequestError(
      '모든 필수 필드를 입력해주세요.',
      'ADMIN_MISSING_REQUIRED_FIELDS',
    );
  }

  // 날짜 검증
  const startDate = new Date(start_at);
  const endDate = new Date(end_at);
  const now = new Date();

  if (startDate <= now) {
    throw new BadRequestError(
      '이벤트 시작 시간은 현재 시간보다 이후여야 합니다.',
      'ADMIN_INVALID_START_TIME',
    );
  }

  if (endDate <= startDate) {
    throw new BadRequestError(
      '이벤트 종료 시간은 시작 시간보다 이후여야 합니다.',
      'ADMIN_INVALID_END_TIME',
    );
  }

  // 정원 검증
  if (capacity <= 0) {
    throw new BadRequestError(
      '정원은 1명 이상이어야 합니다.',
      'ADMIN_INVALID_CAPACITY',
    );
  }

  const event = await adminRepository.createEvent(eventData);
  return event;
};

/**
 * 특정 이벤트의 참여자 목록을 조회합니다.
 * @param {number} eventId - 이벤트 ID
 * @returns {Array} 참여자 목록
 */
export const getEventParticipants = async (eventId) => {
  // 이벤트 존재 여부 확인
  const event = await adminRepository.findEventById(eventId);
  if (!event) {
    throw new NotFoundError(
      '해당 이벤트를 찾을 수 없습니다.',
      'ADMIN_EVENT_NOT_FOUND',
    );
  }

  const participants = await adminRepository.findEventParticipants(eventId);
  return participants;
};
