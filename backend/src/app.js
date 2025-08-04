import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection as testDBConnection } from './config/database.js';
import { testRedisConnection } from './config/redis.js';
import swaggerUi from 'swagger-ui-express';
import specs from './config/swagger.js';
import apiRouter from './routes/index.js';
import errorMiddleware from './middlewares/error.middleware.js';
import { startSessionCleanupScheduler } from './utils/session-cleanup.util.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 기본 보안 및 파싱 설정
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger 리소스 로컬 제공
app.use(
  '/swagger-ui',
  express.static(path.join(__dirname, 'node_modules/swagger-ui-dist')),
);

// Swagger JSON endpoint
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Swagger UI endpoint
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    swaggerOptions: {
      url: '/api-docs/swagger.json',
      docExpansion: 'list',
      filter: true,
      showRequestHeaders: true,
    },
    customCssUrl: '/swagger-ui/swagger-ui.css',
    customJs: [
      '/swagger-ui/swagger-ui-bundle.js',
      '/swagger-ui/swagger-ui-standalone-preset.js',
    ],
    customSiteTitle: 'MyMatchLog API Docs',
  }),
);

// 기본 라우트 및 에러 처리
app.use('/api', apiRouter);
app.get('/', (req, res) => res.send('Hello World!'));
app.use(errorMiddleware);

// 서버 시작
const startServer = async () => {
  try {
    if (process.env.NODE_ENV !== 'test' && !process.env.DOCKER_ENV) {
      await testDBConnection();
      await testRedisConnection();
    }
    app.listen(port, '0.0.0.0', () => {
      console.log(`✅ Server is running on http://localhost:${port}`);
      // 세션 정리 스케줄러 시작
      startSessionCleanupScheduler();
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app };
