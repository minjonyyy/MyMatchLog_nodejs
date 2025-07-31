import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 테스트 환경에서는 데이터베이스 연결을 비활성화
let pool;

if (process.env.NODE_ENV === 'test') {
  // 테스트 환경에서는 Mock Pool 생성
  pool = {
    getConnection: async () => ({
      release: () => {}
    })
  };
} else {
  pool = mysql.createPool({
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
}

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