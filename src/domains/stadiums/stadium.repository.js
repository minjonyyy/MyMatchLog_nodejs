import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mymatchlog',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const findAllStadiums = async () => {
  const [rows] = await pool.execute(`
    SELECT id, name, city, capacity, created_at, updated_at
    FROM stadiums
    ORDER BY name ASC
  `);
  return rows;
};

export const findStadiumById = async (id) => {
  const [rows] = await pool.execute(`
    SELECT id, name, city, capacity, created_at, updated_at
    FROM stadiums
    WHERE id = ?
  `, [id]);
  return rows[0];
};

export const findStadiumByName = async (name) => {
  const [rows] = await pool.execute(`
    SELECT id, name, city, capacity, created_at, updated_at
    FROM stadiums
    WHERE name = ?
  `, [name]);
  return rows[0];
}; 