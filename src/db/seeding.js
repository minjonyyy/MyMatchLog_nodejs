import pool from '../config/database.js';

const teamsData = [
  { name: 'LG 트윈스', home_stadium: '서울종합운동장 야구장' },
  { name: '두산 베어스', home_stadium: '서울종합운동장 야구장' },
  { name: 'SSG 랜더스', home_stadium: '인천SSG랜더스필드' },
  { name: '키움 히어로즈', home_stadium: '고척스카이돔' },
  { name: 'NC 다이노스', home_stadium: '창원NC파크' },
  { name: 'KIA 타이거즈', home_stadium: '광주기아챔피언스필드' },
  { name: '롯데 자이언츠', home_stadium: '사직야구장' },
  { name: '삼성 라이온즈', home_stadium: '대구삼성라이온즈파크' },
  { name: '한화 이글스', home_stadium: '대전한화생명이글스파크' },
  { name: 'kt wiz', home_stadium: '수원KT위즈파크' },
];

const seedTeams = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('🚀 Starting to seed teams data...');

    // To prevent duplicate entries, clear the table first
    await connection.query('DELETE FROM teams');
    // Reset auto-increment counter
    await connection.query('ALTER TABLE teams AUTO_INCREMENT = 1');

    for (const team of teamsData) {
      const query = 'INSERT INTO teams (name, home_stadium) VALUES (?, ?)';
      await connection.query(query, [team.name, team.home_stadium]);
      console.log(`✅ Seeded: ${team.name}`);
    }

    console.log('🎉 Teams data seeding completed successfully.');
  } catch (err) {
    console.error('❌ Error during teams data seeding:', err);
  } finally {
    if (connection) {
      connection.release();
    }
    pool.end();
  }
};

seedTeams(); 