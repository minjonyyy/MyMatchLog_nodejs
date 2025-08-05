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

    // 1. 현재 이벤트 정보 조회
    const [eventRows] = await connection.query(
      `
      SELECT capacity, participant_count
      FROM events 
      WHERE id = ?
    `,
      [eventId],
    );

    if (eventRows.length === 0) {
      throw new Error('이벤트를 찾을 수 없습니다.');
    }

    const event = eventRows[0];

    // 2. 정원 확인 및 상태 결정
    const isWithinCapacity = event.participant_count < event.capacity;
    const status = isWithinCapacity ? 'WON' : 'APPLIED';

    // 3. 이벤트 참여자 수 증가
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

    // 4. 참여 정보 생성 (정원 내면 WINNER, 초과면 APPLIED)
    const [insertResult] = await connection.query(
      `
      INSERT INTO event_participations (user_id, event_id, status, created_at)
      VALUES (?, ?, ?, NOW())
    `,
      [userId, eventId, status],
    );

    await connection.commit();

    // 5. 생성된 참여 정보 반환
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

/**
 * 사용자의 이벤트 참여 내역을 조회합니다.
 * @param {number} userId - 사용자 ID
 * @param {number} offset - 오프셋
 * @param {number} limit - 제한 개수
 * @returns {Object} 참여 내역 및 총 개수
 */
export const findParticipationsByUserId = async (
  userId,
  offset = 0,
  limit = 10,
) => {
  // 총 개수 조회
  const [countRows] = await pool.query(
    `
    SELECT COUNT(*) as totalCount
    FROM event_participations ep
    JOIN events e ON ep.event_id = e.id
    WHERE ep.user_id = ?
  `,
    [userId],
  );

  const totalCount = countRows[0].totalCount;

  // 참여 내역 조회 (최신순)
  const [rows] = await pool.query(
    `
    SELECT 
      ep.id,
      ep.user_id,
      ep.event_id,
      ep.status,
      ep.created_at as participated_at,
      e.id as event_id,
      e.title,
      e.description,
      e.start_at,
      e.end_at,
      e.gift,
      e.capacity,
      e.participant_count,
      e.created_at as event_created_at,
      e.updated_at as event_updated_at
    FROM event_participations ep
    JOIN events e ON ep.event_id = e.id
    WHERE ep.user_id = ?
    ORDER BY ep.created_at DESC
    LIMIT ? OFFSET ?
  `,
    [userId, limit, offset],
  );

  // 결과 포맷팅
  const participations = rows.map((row) => ({
    id: row.id,
    event: {
      id: row.event_id,
      title: row.title,
      description: row.description,
      start_at: row.start_at,
      end_at: row.end_at,
      gift: row.gift,
      capacity: row.capacity,
      participant_count: row.participant_count,
      created_at: row.event_created_at,
      updated_at: row.event_updated_at,
    },
    is_winner: row.status === 'WON', // WON 상태면 당첨
    participated_at: row.participated_at,
    result_announced_at:
      row.status === 'WON' || row.status === 'LOST'
        ? row.participated_at
        : null,
  }));

  return {
    participations,
    totalCount,
  };
};
