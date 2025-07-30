import { NotFoundError, ConflictError, BadRequestError } from '../../errors/http.error.js';
import * as eventRepository from './event.repository.js';
import redisClient from '../../config/redis.js';

/**
 * 진행 중인 이벤트 목록을 조회합니다.
 * @returns {Array} 이벤트 목록
 */
export const getActiveEvents = async () => {
  const events = await eventRepository.findActiveEvents();
  return events;
};

/**
 * 특정 이벤트의 상세 정보를 조회합니다.
 * @param {number} eventId - 이벤트 ID
 * @returns {Object} 이벤트 정보
 */
export const getEventById = async (eventId) => {
  const event = await eventRepository.findEventById(eventId);
  if (!event) {
    throw new NotFoundError('해당 이벤트를 찾을 수 없습니다.', 'EVENT_NOT_FOUND');
  }
  return event;
};

/**
 * 이벤트에 선착순으로 참여합니다. Redis 분산 락을 사용하여 동시성 제어를 합니다.
 * @param {number} eventId - 이벤트 ID
 * @param {number} userId - 사용자 ID
 * @returns {Object} 참여 정보
 */
export const participateInEvent = async (eventId, userId) => {
  const lockKey = `event:${eventId}:lock`;
  const lockValue = `user:${userId}:${Date.now()}`;
  const lockTTL = 10; // 10초

  try {
    // 1. 이벤트 존재 여부 및 참여 가능 여부 확인
    const event = await eventRepository.findEventById(eventId);
    if (!event) {
      throw new NotFoundError('해당 이벤트를 찾을 수 없습니다.', 'EVENT_NOT_FOUND');
    }

    const now = new Date();
    if (now < event.start_at || now > event.end_at) {
      throw new BadRequestError('이벤트 참여 기간이 아닙니다.', 'EVENT_PERIOD_INVALID');
    }

    // 2. 이미 참여했는지 확인
    const existingParticipation = await eventRepository.findParticipationByUserAndEvent(userId, eventId);
    if (existingParticipation) {
      throw new ConflictError('이미 참여한 이벤트입니다.', 'EVENT_ALREADY_PARTICIPATED');
    }

    // 3. Redis 분산 락 획득 시도
    const lockAcquired = await redisClient.set(lockKey, lockValue, 'EX', lockTTL, 'NX');
    if (!lockAcquired) {
      throw new ConflictError('다른 사용자가 처리 중입니다. 잠시 후 다시 시도해주세요.', 'EVENT_PROCESSING');
    }

    try {
      // 4. 정원 확인 및 참여자 수 증가
      if (event.participant_count >= event.capacity) {
        throw new ConflictError('선착순 정원이 마감되었습니다.', 'EVENT_CAPACITY_EXCEEDED');
      }

      // 5. 참여자 수 증가 및 참여 정보 저장 (트랜잭션)
      const participation = await eventRepository.createParticipationWithIncrement(eventId, userId);
      
      return participation;
    } finally {
      // 6. 락 해제
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      await redisClient.eval(script, 1, lockKey, lockValue);
    }
  } catch (error) {
    // 락 해제 시도
    try {
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      await redisClient.eval(script, 1, lockKey, lockValue);
    } catch (unlockError) {
      console.error('락 해제 중 오류:', unlockError);
    }
    throw error;
  }
}; 