import pool from '../../config/database.js';

/**
 * 새로운 이벤트를 생성합니다.
 * @param {Object} eventData - 이벤트 데이터
 * @returns {Object} 생성된 이벤트 정보
 */
export const createEvent = async (eventData) => {
  const { title, description, start_at, end_at, gift, capacity } = eventData;

  const [result] = await pool.query(
    `
    INSERT INTO events (title, description, start_at, end_at, gift, capacity, participant_count, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, NOW(), NOW())
  `,
    [title, description, start_at, end_at, gift, capacity],
  );

  const [event] = await pool.query(
    `
    SELECT id, title, description, start_at, end_at, gift, capacity, participant_count, created_at, updated_at
    FROM events
    WHERE id = ?
  `,
    [result.insertId],
  );

  return event[0];
};

/**
 * 특정 이벤트를 ID로 조회합니다.
 * @param {number} eventId - 이벤트 ID
 * @returns {Object|null} 이벤트 정보
 */
export const findEventById = async (eventId) => {
  const [rows] = await pool.query(
    `
    SELECT id, title, description, start_at, end_at, gift, capacity, participant_count, created_at, updated_at
    FROM events
    WHERE id = ?
  `,
    [eventId],
  );

  return rows[0] || null;
};

/**
 * 특정 이벤트의 참여자 목록을 조회합니다.
 * @param {number} eventId - 이벤트 ID
 * @returns {Array} 참여자 목록
 */
export const findEventParticipants = async (eventId) => {
  const [rows] = await pool.query(
    `
    SELECT 
      ep.id,
      ep.user_id,
      ep.event_id,
      ep.status,
      ep.created_at,
      u.nickname,
      u.email
    FROM event_participations ep
    JOIN users u ON ep.user_id = u.id
    WHERE ep.event_id = ?
    ORDER BY ep.created_at ASC
  `,
    [eventId],
  );

  return rows;
};
