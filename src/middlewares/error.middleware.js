import { errorResponse } from '../utils/response.util.js';
import BaseError from '../errors/base.error.js';

const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  if (err instanceof BaseError) {
    return errorResponse(res, err);
  }

  // BaseError가 아닌, 예측하지 못한 에러 처리
  return errorResponse(res, {
    statusCode: 500,
    code: 'SERVER_INTERNAL_ERROR',
    message: '서버 내부 오류가 발생했습니다. 관리자에게 문의하세요.',
  });
};

export default errorMiddleware; 