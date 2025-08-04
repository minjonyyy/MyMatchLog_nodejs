import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 테스트 환경에서는 .env.test 파일을 사용
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}

// 마이그레이션용 실제 데이터베이스 연결 생성
const createMigrationPool = () => {
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

const migrationQueries = [
  // Drop tables if they exist to ensure a clean slate
  `DROP TABLE IF EXISTS event_participations;`,
  `DROP TABLE IF EXISTS match_logs;`,
  `DROP TABLE IF EXISTS events;`,
  `DROP TABLE IF EXISTS users;`,
  `DROP TABLE IF EXISTS teams;`,
  `DROP TABLE IF EXISTS stadiums;`,

  // Create stadiums table
  `CREATE TABLE stadiums (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    city VARCHAR(50),
    capacity INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );`,

  // Create teams table
  `CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    logo_url VARCHAR(2048),
    stadium_id INT,
    FOREIGN KEY (stadium_id) REFERENCES stadiums(id)
  );`,

  // Create users table
  `CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(100) NOT NULL UNIQUE,
    favorite_team_id INT,
    refresh_token VARCHAR(512),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (favorite_team_id) REFERENCES teams(id)
  );`,

  // Create match_logs table
  `CREATE TABLE match_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    match_date DATE NOT NULL,
    home_team_id INT NOT NULL,
    away_team_id INT NOT NULL,
    stadium_id INT NOT NULL,
    result ENUM('WIN', 'LOSS', 'DRAW'),
    memo TEXT,
    ticket_image_url VARCHAR(2048),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (home_team_id) REFERENCES teams(id),
    FOREIGN KEY (away_team_id) REFERENCES teams(id),
    FOREIGN KEY (stadium_id) REFERENCES stadiums(id)
  );`,

  // Create events table
  `CREATE TABLE events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    gift VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    participant_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );`,

  // Create event_participations table
  `CREATE TABLE event_participations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    status ENUM('APPLIED', 'WON', 'LOST') NOT NULL DEFAULT 'APPLIED',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, event_id)
  );`,
];

const runMigrations = async () => {
  let connection;
  let pool;
  try {
    pool = createMigrationPool();
    connection = await pool.getConnection();
    console.log('🚀 Starting database migrations...');

    for (const query of migrationQueries) {
      await connection.query(query);
      const queryName = query.split(' ')[2]; // e.g., 'teams;'
      console.log(`✅ Executed: ${queryName}`);
    }

    console.log('🎉 Database migrations completed successfully.');
  } catch (err) {
    console.error('❌ Error during migration:', err);
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

runMigrations();
