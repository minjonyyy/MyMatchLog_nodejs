import { ForbiddenError } from '../errors/http.error.js';

const adminMiddleware = (req, res, next) => {
  try {
    // authMiddleware에서 설정된 사용자 정보 확인
    if (!req.user || !req.user.userId) {
      return next(new ForbiddenError('관리자 권한이 필요합니다.'));
    }

    // JWT 토큰에서 관리자 권한 확인
    if (!req.user.isAdmin) {
      return next(new ForbiddenError('관리자 권한이 필요합니다.'));
    }

    // 관리자 권한 확인 완료
    next();
  } catch (error) {
    console.error('관리자 권한 확인 중 오류:', error);
    return next(new ForbiddenError('관리자 권한 확인 중 오류가 발생했습니다.'));
  }
};

export default adminMiddleware; 