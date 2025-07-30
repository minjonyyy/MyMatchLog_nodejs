import pool from '../../config/database.js';

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

export const findUserByNickname = async (nickname) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE nickname = ?', [nickname]);
  return rows[0];
};

export const findUserById = async (userId) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
  return rows[0];
};

export const createUser = async (email, hashedPassword, nickname) => {
  const [result] = await pool.query(
    'INSERT INTO users (email, password, nickname) VALUES (?, ?, ?)',
    [email, hashedPassword, nickname]
  );
  return { id: result.insertId };
};

export const updateRefreshToken = async (userId, refreshToken) => {
  await pool.query('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, userId]);
};
