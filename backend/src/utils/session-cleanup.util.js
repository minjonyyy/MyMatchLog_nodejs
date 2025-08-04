import mysql from 'mysql2/promise';
import dbConfig from '../config/database.js';

/**
 * 만료된 토큰을 정리하는 함수
 */
export const cleanupExpiredTokens = async () => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // 만료된 refresh_token 제거
    const [result] = await connection.query(`
      UPDATE users 
      SET refresh_token = NULL 
      WHERE refresh_token IS NOT NULL 
      AND JSON_EXTRACT(JWT_DECODE(refresh_token), '$.exp') < UNIX_TIMESTAMP()
    `);

    console.log(`✅ 만료된 토큰 정리 완료: ${result.affectedRows}개 토큰 제거`);
    return result.affectedRows;
  } catch (error) {
    console.error('❌ 토큰 정리 실패:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

/**
 * 주기적으로 세션을 정리하는 스케줄러
 */
export const startSessionCleanupScheduler = () => {
  // 매일 자정에 실행
  const cleanupInterval = 24 * 60 * 60 * 1000; // 24시간

  const runCleanup = async () => {
    try {
      await cleanupExpiredTokens();
    } catch (error) {
      console.error('세션 정리 스케줄러 오류:', error);
    }
  };

  // 즉시 한 번 실행
  runCleanup();

  // 주기적으로 실행
  global.setInterval(runCleanup, cleanupInterval);

  console.log('🔄 세션 정리 스케줄러가 시작되었습니다. (24시간마다 실행)');
};
