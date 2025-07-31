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
  console.log('🔗 Team-Stadium 연관관계 설정 중...');

  // 1. stadium_id 컬럼 추가
  console.log('📝 stadium_id 컬럼 추가 중...');
  await connection.execute(`
    ALTER TABLE teams ADD COLUMN stadium_id INT
  `);

  // 2. 기존 home_stadium 데이터를 stadium_id로 변환
  console.log('🔄 기존 home_stadium 데이터 마이그레이션 중...');

  const [teams] = await connection.execute(
    'SELECT id, name, home_stadium FROM teams',
  );

  for (const team of teams) {
    if (team.home_stadium) {
      // stadiums 테이블에서 해당 이름의 ID 찾기
      const [stadiumRows] = await connection.execute(
        'SELECT id FROM stadiums WHERE name = ?',
        [team.home_stadium],
      );

      if (stadiumRows.length > 0) {
        const stadiumId = stadiumRows[0].id;
        await connection.execute(
          'UPDATE teams SET stadium_id = ? WHERE id = ?',
          [stadiumId, team.id],
        );
        console.log(
          `✅ ${team.name}: ${team.home_stadium} → stadium_id: ${stadiumId}`,
        );
      } else {
        console.log(
          `⚠️ ${team.name}: ${team.home_stadium}에 해당하는 stadium을 찾을 수 없음`,
        );
      }
    }
  }

  // 3. 외래키 제약조건 추가
  console.log('🔗 외래키 제약조건 추가 중...');
  await connection.execute(`
    ALTER TABLE teams 
    ADD FOREIGN KEY (stadium_id) REFERENCES stadiums(id)
  `);

  // 4. 기존 home_stadium 컬럼 제거
  console.log('🗑️ 기존 home_stadium 컬럼 제거 중...');
  await connection.execute(`
    ALTER TABLE teams DROP COLUMN home_stadium
  `);

  console.log('✅ Team-Stadium 연관관계 설정 완료');

  // 결과 확인
  const [updatedTeams] = await connection.execute(`
    SELECT t.id, t.name, t.stadium_id, s.name as stadium_name 
    FROM teams t 
    LEFT JOIN stadiums s ON t.stadium_id = s.id
  `);

  console.log('\n📋 업데이트된 Teams 목록:');
  console.table(updatedTeams);
} catch (error) {
  console.error('❌ 마이그레이션 실패:', error);
} finally {
  await connection.end();
}
