import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'mymatchlog_dev',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+09:00', // 한국 시간대 설정
});

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection is successful.');
    connection.release();
  } catch (err) {
    console.error('❌ Unable to connect to the database:', err);
    // On connection error, exit the process
    process.exit(1);
  }
};

export default pool; 