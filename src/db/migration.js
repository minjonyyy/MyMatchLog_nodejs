import pool from '../config/database.js';

const migrationQueries = [
  // Drop tables if they exist to ensure a clean slate
  `DROP TABLE IF EXISTS event_participations;`,
  `DROP TABLE IF EXISTS match_logs;`,
  `DROP TABLE IF EXISTS events;`,
  `DROP TABLE IF EXISTS users;`,
  `DROP TABLE IF EXISTS teams;`,

  // Create teams table
  `CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    logo_url VARCHAR(2048),
    home_stadium VARCHAR(100)
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
    home_team VARCHAR(50) NOT NULL,
    away_team VARCHAR(50) NOT NULL,
    stadium VARCHAR(100) NOT NULL,
    result ENUM('WIN', 'LOSS', 'DRAW'),
    memo TEXT,
    ticket_image_url VARCHAR(2048),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
  try {
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
  } finally {
    if (connection) {
      connection.release();
    }
    pool.end();
  }
};

runMigrations(); 