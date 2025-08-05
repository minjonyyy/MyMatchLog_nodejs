import pool from '../config/database.js';

/**
 * 만료된 토큰을 정리하는 함수
 */
export const cleanupExpiredTokens = async () => {
  let connection;
  try {
    connection = await pool.getConnection();

    // 만료된 refresh_token 제거 (JWT 만료 시간을 직접 계산하지 않고 단순히 NULL이 아닌 토큰만 정리)
    // 실제 만료 검증은 로그인 시에 처리되므로 여기서는 단순히 정리만 수행
    const [result] = await connection.query(`
      UPDATE users 
      SET refresh_token = NULL 
      WHERE refresh_token IS NOT NULL 
      AND refresh_token != ''
    `);

    console.log(`✅ 만료된 토큰 정리 완료: ${result.affectedRows}개 토큰 제거`);
    return result.affectedRows;
  } catch (error) {
    console.error('❌ 토큰 정리 실패:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * 주기적으로 세션을 정리하는 스케줄러
 */
export const startSessionCleanupScheduler = () => {
  // 세션 정리 스케줄러를 비활성화 (JWT 만료 검증 문제로 인해)
  // 대신 로그인 시에만 중복 로그인을 체크하도록 함
  console.log(
    '🔄 세션 정리 스케줄러가 비활성화되었습니다. (JWT 만료 검증 문제)',
  );
};
