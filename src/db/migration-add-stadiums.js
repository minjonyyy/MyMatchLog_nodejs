import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mymatchlog'
});

try {
  console.log('🏟️ Stadium 테이블 생성 중...');
  
  // Stadium 테이블 생성
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS stadiums (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      city VARCHAR(50),
      capacity INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // 기본 경기장 데이터 삽입
  const defaultStadiums = [
    { name: '잠실야구장', city: '서울', capacity: 25000 },
    { name: '고척스카이돔', city: '서울', capacity: 16000 },
    { name: '인천SSG랜더스필드', city: '인천', capacity: 23000 },
    { name: '수원KT위즈파크', city: '수원', capacity: 18000 },
    { name: '대구삼성라이온즈파크', city: '대구', capacity: 24000 },
    { name: '부산사직야구장', city: '부산', capacity: 28000 },
    { name: '광주기아챔피언스필드', city: '광주', capacity: 22000 },
    { name: '대전한화생명이글스파크', city: '대전', capacity: 13000 },
    { name: '창원NC파크', city: '창원', capacity: 22000 },
    { name: '울산문수야구장', city: '울산', capacity: 12000 }
  ];

  for (const stadium of defaultStadiums) {
    await connection.execute(
      'INSERT IGNORE INTO stadiums (name, city, capacity) VALUES (?, ?, ?)',
      [stadium.name, stadium.city, stadium.capacity]
    );
  }

  console.log('✅ Stadium 테이블 생성 및 기본 데이터 삽입 완료');

  console.log('🔧 match_logs 테이블에 stadium_id 컬럼 추가 중...');
  
  // match_logs 테이블에 stadium_id 컬럼 추가
  await connection.execute(`
    ALTER TABLE match_logs 
    ADD COLUMN stadium_id INT,
    ADD FOREIGN KEY (stadium_id) REFERENCES stadiums(id)
  `);

  console.log('✅ stadium_id 컬럼 추가 완료');

  // 기존 데이터 마이그레이션 (stadium 문자열을 stadium_id로 변환)
  console.log('🔄 기존 stadium 데이터 마이그레이션 중...');
  
  const [rows] = await connection.execute('SELECT DISTINCT stadium FROM match_logs WHERE stadium IS NOT NULL');
  
  for (const row of rows) {
    const stadiumName = row.stadium;
    if (stadiumName) {
      // stadiums 테이블에서 해당 이름의 ID 찾기
      const [stadiumRows] = await connection.execute(
        'SELECT id FROM stadiums WHERE name = ?',
        [stadiumName]
      );
      
      if (stadiumRows.length > 0) {
        const stadiumId = stadiumRows[0].id;
        // match_logs 테이블 업데이트
        await connection.execute(
          'UPDATE match_logs SET stadium_id = ? WHERE stadium = ?',
          [stadiumId, stadiumName]
        );
        console.log(`✅ ${stadiumName} → stadium_id: ${stadiumId}`);
      } else {
        // 없는 경기장이면 새로 추가
        const [result] = await connection.execute(
          'INSERT INTO stadiums (name) VALUES (?)',
          [stadiumName]
        );
        const newStadiumId = result.insertId;
        await connection.execute(
          'UPDATE match_logs SET stadium_id = ? WHERE stadium = ?',
          [newStadiumId, stadiumName]
        );
        console.log(`✅ 새 경기장 추가: ${stadiumName} → stadium_id: ${newStadiumId}`);
      }
    }
  }

  console.log('✅ 기존 데이터 마이그레이션 완료');

} catch (error) {
  console.error('❌ 마이그레이션 실패:', error);
} finally {
  await connection.end();
} 