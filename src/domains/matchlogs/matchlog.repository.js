import pool from '../../config/database.js';

// 특정 사용자의 직관 기록 목록 조회 (페이지네이션 포함)
export const findMatchLogsByUserId = async (userId, limit = 10, offset = 0) => {
  const [rows] = await pool.query(
    `SELECT 
       ml.id, ml.match_date, ml.stadium, ml.result, ml.memo, ml.ticket_image_url, 
       ml.created_at, ml.updated_at,
       ht.id as home_team_id, ht.name as home_team_name,
       at.id as away_team_id, at.name as away_team_name
     FROM match_logs ml
     LEFT JOIN teams ht ON ml.home_team_id = ht.id
     LEFT JOIN teams at ON ml.away_team_id = at.id
     WHERE ml.user_id = ? 
     ORDER BY ml.match_date DESC, ml.created_at DESC 
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  
  // 데이터 구조 변환
  return rows.map(row => ({
    id: row.id,
    match_date: row.match_date,
    home_team: {
      id: row.home_team_id,
      name: row.home_team_name
    },
    away_team: {
      id: row.away_team_id,
      name: row.away_team_name
    },
    stadium: row.stadium,
    result: row.result,
    memo: row.memo,
    ticket_image_url: row.ticket_image_url,
    created_at: row.created_at,
    updated_at: row.updated_at
  }));
};

// 특정 사용자의 총 직관 기록 수 조회 (페이지네이션용)
export const countMatchLogsByUserId = async (userId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as total FROM match_logs WHERE user_id = ?',
    [userId]
  );
  return rows[0].total;
};

// 직관 기록 상세 조회 (소유권 검증 포함)
export const findMatchLogById = async (matchLogId) => {
  const [rows] = await pool.query(
    `SELECT 
       ml.*, 
       ht.id as home_team_id, ht.name as home_team_name,
       at.id as away_team_id, at.name as away_team_name
     FROM match_logs ml
     LEFT JOIN teams ht ON ml.home_team_id = ht.id
     LEFT JOIN teams at ON ml.away_team_id = at.id
     WHERE ml.id = ?`,
    [matchLogId]
  );
  
  if (rows.length === 0) return null;
  
  const row = rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    match_date: row.match_date,
    home_team: {
      id: row.home_team_id,
      name: row.home_team_name
    },
    away_team: {
      id: row.away_team_id,
      name: row.away_team_name
    },
    stadium: row.stadium,
    result: row.result,
    memo: row.memo,
    ticket_image_url: row.ticket_image_url,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

// 직관 기록 생성
export const createMatchLog = async (matchLogData) => {
  const { user_id, match_date, home_team_id, away_team_id, stadium, result, memo, ticket_image_url } = matchLogData;
  
  const [insertResult] = await pool.query(
    `INSERT INTO match_logs (user_id, match_date, home_team_id, away_team_id, stadium, result, memo, ticket_image_url) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id, match_date, home_team_id, away_team_id, stadium, result, memo, ticket_image_url]
  );
  
  return { id: insertResult.insertId };
};

// 직관 기록 수정
export const updateMatchLog = async (matchLogId, updateData) => {
  const fields = [];
  const values = [];

  // 허용된 필드만 업데이트 (team_id 포함)
  const allowedFields = ['match_date', 'home_team_id', 'away_team_id', 'stadium', 'result', 'memo', 'ticket_image_url'];
  
  allowedFields.forEach(key => {
    if (updateData[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    }
  });

  if (fields.length === 0) return;

  values.push(matchLogId);
  const query = `UPDATE match_logs SET ${fields.join(', ')} WHERE id = ?`;
  
  await pool.query(query, values);
};

// 직관 기록 삭제
export const deleteMatchLog = async (matchLogId) => {
  await pool.query('DELETE FROM match_logs WHERE id = ?', [matchLogId]);
}; 