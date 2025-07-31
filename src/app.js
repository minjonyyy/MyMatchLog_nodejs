import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection as testDBConnection } from './config/database.js';
import { testRedisConnection } from './config/redis.js';
import swaggerUi from 'swagger-ui-express';
import specs from './config/swagger.js';
import apiRouter from './routes/index.js';
import errorMiddleware from './middlewares/error.middleware.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  swaggerOptions: {
    url: '/api-docs/swagger.json',
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
  },
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'MyMatchLog API Documentation',
}));

// Swagger JSON endpoint
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// API 라우터 적용
app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// 에러 핸들링 미들웨어는 마지막에 등록
app.use(errorMiddleware);

const startServer = async () => {
  try {
    // 테스트 환경이나 Docker 환경에서는 데이터베이스 연결 테스트 건너뛰기
    if (process.env.NODE_ENV !== 'test' && !process.env.DOCKER_ENV) {
      await testDBConnection();
      await testRedisConnection();
    }

    app.listen(port, '0.0.0.0', () => {
      console.log(`✅ Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// 개발 환경에서만 서버 시작
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app };
