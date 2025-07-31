import pool from '../../config/database.js';

/**
 * 진행 중인 이벤트 목록을 조회합니다.
 * @returns {Array} 이벤트 목록
 */
export const findActiveEvents = async () => {
  const now = new Date();
  const [rows] = await pool.query(
    `
    SELECT id, title, description, start_at, end_at, gift, capacity, participant_count, created_at, updated_at
    FROM events
    WHERE end_at >= ?
    ORDER BY start_at ASC
  `,
    [now],
  );

  return rows;
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
 * 사용자의 특정 이벤트 참여 여부를 확인합니다.
 * @param {number} userId - 사용자 ID
 * @param {number} eventId - 이벤트 ID
 * @returns {Object|null} 참여 정보
 */
export const findParticipationByUserAndEvent = async (userId, eventId) => {
  const [rows] = await pool.query(
    `
    SELECT id, user_id, event_id, status, created_at
    FROM event_participations
    WHERE user_id = ? AND event_id = ?
  `,
    [userId, eventId],
  );

  return rows[0] || null;
};

/**
 * 이벤트 참여를 생성하고 참여자 수를 증가시킵니다. (트랜잭션)
 * @param {number} eventId - 이벤트 ID
 * @param {number} userId - 사용자 ID
 * @returns {Object} 생성된 참여 정보
 */
export const createParticipationWithIncrement = async (eventId, userId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. 이벤트 참여자 수 증가
    const [updateResult] = await connection.query(
      `
      UPDATE events 
      SET participant_count = participant_count + 1, updated_at = NOW()
      WHERE id = ? AND participant_count < capacity
    `,
      [eventId],
    );

    if (updateResult.affectedRows === 0) {
      throw new Error('이벤트 정원이 마감되었습니다.');
    }

    // 2. 참여 정보 생성
    const [insertResult] = await connection.query(
      `
      INSERT INTO event_participations (user_id, event_id, status, created_at)
      VALUES (?, ?, 'APPLIED', NOW())
    `,
      [userId, eventId],
    );

    await connection.commit();

    // 3. 생성된 참여 정보 반환
    const [participation] = await connection.query(
      `
      SELECT id, user_id, event_id, status, created_at
      FROM event_participations
      WHERE id = ?
    `,
      [insertResult.insertId],
    );

    return participation[0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
