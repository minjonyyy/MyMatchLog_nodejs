import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mymatchlog',
});

try {
  console.log('🗑️ 기존 stadium 컬럼 제거 중...');

  // match_logs 테이블에서 기존 stadium 컬럼 제거
  await connection.execute(`
    ALTER TABLE match_logs DROP COLUMN stadium
  `);

  console.log('✅ 기존 stadium 컬럼 제거 완료');
} catch (error) {
  console.error('❌ 마이그레이션 실패:', error);
} finally {
  await connection.end();
}
