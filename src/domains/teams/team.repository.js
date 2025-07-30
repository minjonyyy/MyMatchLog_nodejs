import pool from '../../config/database.js';

export const findAllTeams = async () => {
  const [rows] = await pool.query('SELECT * FROM teams ORDER BY id ASC');
  return rows;
}; 