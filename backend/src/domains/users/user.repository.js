import pool from '../../config/database.js';

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [
    email,
  ]);
  return rows[0];
};

export const findUserByNickname = async (nickname) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE nickname = ?', [
    nickname,
  ]);
  return rows[0];
};

export const findUserById = async (userId) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
  return rows[0];
};

export const createUser = async (email, hashedPassword, nickname) => {
  const [result] = await pool.query(
    'INSERT INTO users (email, password, nickname) VALUES (?, ?, ?)',
    [email, hashedPassword, nickname],
  );
  return { id: result.insertId };
};

export const updateRefreshToken = async (userId, refreshToken) => {
  await pool.query('UPDATE users SET refresh_token = ? WHERE id = ?', [
    refreshToken,
    userId,
  ]);
};

export const updateUser = async (userId, updateData) => {
  const { nickname, favorite_team_id } = updateData;
  const fields = [];
  const values = [];

  if (nickname !== undefined) {
    fields.push('nickname = ?');
    values.push(nickname);
  }

  if (favorite_team_id !== undefined) {
    fields.push('favorite_team_id = ?');
    values.push(favorite_team_id);
  }

  if (fields.length === 0) return;

  values.push(userId);
  const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

  await pool.query(query, values);
};
