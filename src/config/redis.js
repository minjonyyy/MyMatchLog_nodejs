import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = new Redis({
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