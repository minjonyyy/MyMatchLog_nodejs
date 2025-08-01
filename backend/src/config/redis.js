import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// 테스트 환경에서는 Redis 연결을 비활성화
let redisClient;

if (process.env.NODE_ENV === 'test') {
  // 테스트 환경에서는 Mock Redis 클라이언트 생성
  redisClient = {
    on: () => {},
    ping: async () => 'PONG',
    disconnect: () => {},
  };
} else {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000); // 2초까지 재시도 간격 증가
      return delay;
    },
  });

  redisClient.on('connect', () => {
    console.log('✅ Connected to Redis.');
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
  });
}

export const testRedisConnection = async () => {
  try {
    const pong = await redisClient.ping();
    if (pong === 'PONG') {
      console.log('✅ Redis connection is successful.');
    } else {
      throw new Error('Redis PING command failed.');
    }
  } catch (err) {
    console.error('❌ Unable to connect to Redis:', err);
    process.exit(1);
  }
};

export default redisClient;
