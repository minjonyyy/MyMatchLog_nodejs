import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/http.error.js';

const authMiddleware = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return next(new UnauthorizedError('인증 정보가 없습니다.'));
  }

  const [tokenType, tokenValue] = authorization.split(' ');
  if (tokenType !== 'Bearer' || !tokenValue) {
    return next(
      new UnauthorizedError('지원하지 않는 인증 방식이거나, 토큰이 없습니다.'),
    );
  }

  try {
    const decoded = jwt.verify(tokenValue, process.env.ACCESS_TOKEN_SECRET_KEY);
    req.user = decoded; // req.user에 사용자 정보 저장 (userId, isAdmin 포함)
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('인증 정보가 만료되었습니다.'));
    }
    return next(new UnauthorizedError('인증 정보가 유효하지 않습니다.'));
  }
};

export default authMiddleware;
