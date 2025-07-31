import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const migration = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'dbpassword',
    database: process.env.DB_NAME || 'mymatchlog_dev',
  });

  try {
    console.log('🔄 관리자 권한 컬럼 추가 마이그레이션 시작...');

    // users 테이블에 is_admin 컬럼 추가
    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE 
      COMMENT '관리자 권한 여부'
    `);

    console.log('✅ users 테이블에 is_admin 컬럼이 성공적으로 추가되었습니다.');

    // 기존 사용자 중 첫 번째 사용자를 관리자로 설정 (테스트용)
    await connection.execute(`
      UPDATE users 
      SET is_admin = TRUE 
      WHERE id = 1
    `);

    console.log('✅ 첫 번째 사용자(ID: 1)를 관리자로 설정했습니다.');
  } catch (error) {
    console.error('❌ 마이그레이션 중 오류 발생:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
};

// 스크립트로 직접 실행할 때만 마이그레이션 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  migration()
    .then(() => {
      console.log('🎉 관리자 권한 마이그레이션이 완료되었습니다.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 마이그레이션 실패:', error);
      process.exit(1);
    });
}

export default migration;
