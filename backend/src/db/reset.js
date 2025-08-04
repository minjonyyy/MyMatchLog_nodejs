import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const resetDatabase = async () => {
  let connection

  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'mymatchlog',
    })

    console.log('✅ 데이터베이스 연결 성공')

    // 외래키 제약조건 비활성화
    await connection.query('SET FOREIGN_KEY_CHECKS = 0')
    console.log('✅ 외래키 제약조건 비활성화')

    // 모든 테이블 삭제 (외래키 제약조건 고려)
    const tables = [
      'match_logs',
      'event_participations',
      'users', 
      'teams',
      'stadiums',
      'events'
    ]

    for (const table of tables) {
      try {
        await connection.query(`DROP TABLE IF EXISTS ${table}`)
        console.log(`✅ ${table} 테이블 삭제 완료`)
      } catch (error) {
        console.error(`❌ ${table} 테이블 삭제 실패:`, error.message)
      }
    }

    // 외래키 제약조건 재활성화
    await connection.query('SET FOREIGN_KEY_CHECKS = 1')
    console.log('✅ 외래키 제약조건 재활성화')

    console.log('✅ 데이터베이스 초기화 완료')

  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error)
  } finally {
    if (connection) {
      await connection.end()
      console.log('✅ 데이터베이스 연결 종료')
    }
  }
}

resetDatabase() 