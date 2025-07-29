import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import errorMiddleware from './middlewares/error.middleware.js';
import { NotFoundError } from './errors/http.error.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello, MyMatchLog!');
});

// 404 핸들러
app.use((req, res, next) => {
  next(new NotFoundError('요청하신 페이지를 찾을 수 없습니다.'));
});

// 에러 핸들링 미들웨어
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 