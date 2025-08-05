import pool from '../../config/database.js';

/**
 * 진행 중인 이벤트 목록을 조회합니다.
 * @returns {Array} 이벤트 목록
 */
export const findActiveEvents = async () => {
  const [rows] = await pool.query(
    `
    SELECT id, title, description, start_at, end_at, gift, capacity, participant_count, created_at, updated_at
    FROM events
    ORDER BY start_at ASC
  `,
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
    const [eventResult] = await connection.query(
      `
      SELECT capacity, participant_count
      FROM events 
      WHERE id = ?
    `,
      [eventId],
    );

    if (eventResult.length === 0) {
      throw new Error('이벤트를 찾을 수 없습니다.');
    }

    const event = eventResult[0];
    const isWithinCapacity = event.participant_count < event.capacity;

    // 2. 이벤트 참여자 수 증가 (정원 마감 여부와 관계없이)
    const [updateResult] = await connection.query(
      `
      UPDATE events 
      SET participant_count = participant_count + 1, updated_at = NOW()
      WHERE id = ?
    `,
      [eventId],
    );

    // 3. 참여 순서 결정 (정원 초과 시에도 순서 기록)
    const participationOrder = event.participant_count + 1;

    // 4. 참여 정보 생성 (모든 참여를 APPLIED로 저장, 순서 기록)
    const [insertResult] = await connection.query(
      `
      INSERT INTO event_participations (user_id, event_id, status, participation_order, created_at)
      VALUES (?, ?, 'APPLIED', ?, NOW())
    `,
      [userId, eventId, participationOrder],
    );

    await connection.commit();

    // 5. 생성된 참여 정보 반환
    const [participation] = await connection.query(
      `
      SELECT id, user_id, event_id, status, participation_order, created_at
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
      ep.participation_order,
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
    status: row.status, // APPLIED, WON, LOST
    participation_order: row.participation_order,
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

/**
 * 이벤트 결과를 발표합니다. 참여 순서에 따라 WON/LOST 상태를 결정합니다.
 * @param {number} eventId - 이벤트 ID
 * @returns {Object} 발표 결과
 */
export const announceEventResults = async (eventId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. 이벤트 정보 조회
    const [eventRows] = await connection.query(
      `
      SELECT capacity
      FROM events 
      WHERE id = ?
    `,
      [eventId],
    );

    if (eventRows.length === 0) {
      throw new Error('이벤트를 찾을 수 없습니다.');
    }

    const capacity = eventRows[0].capacity;

    // 2. 참여 순서에 따라 결과 업데이트
    const [updateResult] = await connection.query(
      `
      UPDATE event_participations 
      SET status = CASE 
        WHEN participation_order <= ? THEN 'WON'
        ELSE 'LOST'
      END
      WHERE event_id = ? AND status = 'APPLIED'
    `,
      [capacity, eventId],
    );

    await connection.commit();

    // 3. 업데이트된 결과 조회
    const [results] = await connection.query(
      `
      SELECT 
        ep.id,
        ep.user_id,
        ep.event_id,
        ep.status,
        ep.participation_order,
        ep.created_at
      FROM event_participations ep
      WHERE ep.event_id = ? AND ep.status IN ('WON', 'LOST')
      ORDER BY ep.participation_order
    `,
      [eventId],
    );

    return {
      eventId,
      capacity,
      totalParticipants: results.length,
      winners: results.filter((r) => r.status === 'WON').length,
      losers: results.filter((r) => r.status === 'LOST').length,
      results,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * 특정 사용자의 이벤트 참여 상태를 조회합니다.
 * @param {number} userId - 사용자 ID
 * @param {number} eventId - 이벤트 ID
 * @returns {Object|null} 참여 정보 또는 null
 */
export const findParticipationStatus = async (userId, eventId) => {
  const [rows] = await pool.query(
    `
    SELECT 
      ep.id,
      ep.user_id,
      ep.event_id,
      ep.status,
      ep.participation_order,
      ep.created_at
    FROM event_participations ep
    WHERE ep.user_id = ? AND ep.event_id = ?
  `,
    [userId, eventId],
  );

  return rows.length > 0 ? rows[0] : null;
};
