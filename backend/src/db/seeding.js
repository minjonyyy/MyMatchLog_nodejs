import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 테스트 환경에서는 .env.test 파일을 사용
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}

// 시딩용 실제 데이터베이스 연결 생성
const createSeedingPool = () => {
  return mysql.createPool({
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
};

const stadiumsData = [
  { name: '잠실야구장', city: '서울', capacity: 25000 },
  { name: '고척스카이돔', city: '서울', capacity: 16000 },
  { name: '인천SSG랜더스필드', city: '인천', capacity: 23000 },
  { name: '광주기아챔피언스필드', city: '광주', capacity: 27000 },
  { name: '사직야구장', city: '부산', capacity: 28000 },
  { name: '대구삼성라이온즈파크', city: '대구', capacity: 24000 },
  { name: '창원NC파크', city: '창원', capacity: 22000 },
  { name: '수원KT위즈파크', city: '수원', capacity: 18000 },
  { name: '대전한화생명이글스파크', city: '대전', capacity: 13000 },
  { name: '고양위즈파크', city: '고양', capacity: 20000 },
];

const teamsData = [
  { name: 'LG 트윈스', stadium_id: 1 },
  { name: '두산 베어스', stadium_id: 1 },
  { name: 'SSG 랜더스', stadium_id: 3 },
  { name: '키움 히어로즈', stadium_id: 2 },
  { name: 'NC 다이노스', stadium_id: 7 },
  { name: 'KIA 타이거즈', stadium_id: 4 },
  { name: '롯데 자이언츠', stadium_id: 5 },
  { name: '삼성 라이온즈', stadium_id: 6 },
  { name: '한화 이글스', stadium_id: 9 },
  { name: 'kt wiz', stadium_id: 8 },
];

const seedStadiums = async (connection) => {
  console.log('🚀 Starting to seed stadiums data...');

  // To prevent duplicate entries, clear the table first
  await connection.query('DELETE FROM stadiums');
  // Reset auto-increment counter
  await connection.query('ALTER TABLE stadiums AUTO_INCREMENT = 1');

  for (const stadium of stadiumsData) {
    const query =
      'INSERT INTO stadiums (name, city, capacity) VALUES (?, ?, ?)';
    await connection.query(query, [
      stadium.name,
      stadium.city,
      stadium.capacity,
    ]);
    console.log(`✅ Seeded: ${stadium.name}`);
  }

  console.log('🎉 Stadiums data seeding completed successfully.');
};

const seedTeams = async (connection) => {
  console.log('🚀 Starting to seed teams data...');

  // To prevent duplicate entries, clear the table first
  await connection.query('DELETE FROM teams');
  // Reset auto-increment counter
  await connection.query('ALTER TABLE teams AUTO_INCREMENT = 1');

  for (const team of teamsData) {
    const query = 'INSERT INTO teams (name, stadium_id) VALUES (?, ?)';
    await connection.query(query, [team.name, team.stadium_id]);
    console.log(`✅ Seeded: ${team.name}`);
  }

  console.log('🎉 Teams data seeding completed successfully.');
};

const runSeeding = async () => {
  let connection;
  let pool;
  try {
    pool = createSeedingPool();
    connection = await pool.getConnection();

    await seedStadiums(connection);
    await seedTeams(connection);

    console.log('🎉 All seeding completed successfully.');
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
    if (pool) {
      await pool.end();
    }
  }
};

runSeeding();
