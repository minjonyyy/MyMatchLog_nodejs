import pool from '../../config/database.js';

export const findAllTeams = async () => {
  const [rows] = await pool.query(`
    SELECT t.id, t.name, t.logo_url, t.stadium_id, s.name as stadium_name, s.city as stadium_city
    FROM teams t
    LEFT JOIN stadiums s ON t.stadium_id = s.id
    ORDER BY t.id ASC
  `);

  // 데이터 구조 변환
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    logo_url: row.logo_url,
    stadium: row.stadium_id
      ? {
          id: row.stadium_id,
          name: row.stadium_name,
          city: row.stadium_city,
        }
      : null,
  }));
};
