import cron from 'node-cron';
import * as eventService from '../domains/events/event.service.js';
import pool from '../config/database.js';

/**
 * 종료된 이벤트의 결과를 자동으로 발표합니다.
 */
const announceExpiredEventResults = async () => {
  const connection = await pool.getConnection();

  try {
    // 1. 종료되었지만 결과가 발표되지 않은 이벤트 조회
    const [expiredEvents] = await connection.query(
      `
      SELECT DISTINCT e.id, e.title, e.capacity
      FROM events e
      JOIN event_participations ep ON e.id = ep.event_id
      WHERE e.end_at < NOW() 
      AND ep.status = 'APPLIED'
      GROUP BY e.id
      `,
    );

    console.log(
      `🔄 자동 결과 발표: ${expiredEvents.length}개 이벤트 처리 시작`,
    );

    // 2. 각 이벤트의 결과 발표
    for (const event of expiredEvents) {
      try {
        const result = await eventService.announceEventResults(event.id);
        console.log(
          `✅ 이벤트 ${event.id} (${event.title}) 결과 발표 완료: 당첨 ${result.winners}명, 미당첨 ${result.losers}명`,
        );
      } catch (error) {
        console.error(`❌ 이벤트 ${event.id} 결과 발표 실패:`, error.message);
      }
    }

    if (expiredEvents.length > 0) {
      console.log(
        `🎉 자동 결과 발표 완료: ${expiredEvents.length}개 이벤트 처리됨`,
      );
    }
  } catch (error) {
    console.error('❌ 자동 결과 발표 중 오류:', error);
  } finally {
    connection.release();
  }
};

/**
 * 이벤트 결과 자동 발표 스케줄러를 시작합니다.
 * 매분마다 종료된 이벤트를 확인하고 결과를 발표합니다.
 */
export const startEventResultScheduler = () => {
  console.log(
    '🔄 이벤트 결과 자동 발표 스케줄러가 시작되었습니다. (매분마다 실행)',
  );

  cron.schedule('* * * * *', async () => {
    await announceExpiredEventResults();
  });
};
