import {
  successResponse,
  errorResponse,
  createdResponse,
} from '../../utils/response.util.js';
import * as matchLogService from './matchlog.service.js';

export const getMyMatchLogs = async (req, res) => {
  try {
    const userId = req.user.userId; // auth 미들웨어에서 설정
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // 페이지와 limit 유효성 검증
    if (page < 1 || limit < 1 || limit > 100) {
      return errorResponse(res, {
        statusCode: 400,
        code: 'COMMON_INVALID_INPUT',
        message: '페이지는 1 이상, limit은 1~100 사이여야 합니다.',
      });
    }

    const result = await matchLogService.getMyMatchLogs(userId, page, limit);
    return successResponse(res, result, '직관 기록 목록 조회에 성공했습니다.');
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getMatchLogDetail = async (req, res) => {
  try {
    const userId = req.user.userId;
    const matchLogId = parseInt(req.params.id);

    if (!matchLogId || matchLogId < 1) {
      return errorResponse(res, {
        statusCode: 400,
        code: 'COMMON_INVALID_INPUT',
        message: '올바른 직관 기록 ID를 입력해주세요.',
      });
    }

    const matchLog = await matchLogService.getMatchLogDetail(
      matchLogId,
      userId,
    );
    return successResponse(
      res,
      { matchLog },
      '직관 기록 상세 조회에 성공했습니다.',
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const createMatchLog = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { match_date, home_team_id, away_team_id, stadium_id, result, memo } =
      req.body;

    // 업로드된 이미지 URL 가져오기 (S3 업로드 미들웨어에서 처리됨)
    const ticket_image_url = req.file?.location || null;

    // 타입 변환 (문자열로 전송된 ID를 정수로 변환)
    const matchLogData = {
      match_date,
      home_team_id: parseInt(home_team_id),
      away_team_id: parseInt(away_team_id),
      stadium_id: parseInt(stadium_id),
      result,
      memo,
      ticket_image_url,
    };

    const newMatchLog = await matchLogService.createMatchLog(
      userId,
      matchLogData,
    );
    return createdResponse(
      res,
      { matchLogId: newMatchLog.id },
      '직관 기록이 성공적으로 등록되었습니다.',
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const updateMatchLog = async (req, res) => {
  try {
    const userId = req.user.userId;
    const matchLogId = parseInt(req.params.id);
    const updateData = { ...req.body };

    if (!matchLogId || matchLogId < 1) {
      return errorResponse(res, {
        statusCode: 400,
        code: 'COMMON_INVALID_INPUT',
        message: '올바른 직관 기록 ID를 입력해주세요.',
      });
    }

    // 팀 ID가 있으면 정수로 변환
    if (updateData.home_team_id !== undefined) {
      updateData.home_team_id = parseInt(updateData.home_team_id);
    }
    if (updateData.away_team_id !== undefined) {
      updateData.away_team_id = parseInt(updateData.away_team_id);
    }

    // 경기장 ID가 있으면 정수로 변환
    if (updateData.stadium_id !== undefined) {
      updateData.stadium_id = parseInt(updateData.stadium_id);
    }

    // 새로운 이미지가 업로드된 경우 URL 추가
    if (req.file?.location) {
      updateData.ticket_image_url = req.file.location;
    }

    const updatedMatchLog = await matchLogService.updateMatchLog(
      matchLogId,
      userId,
      updateData,
    );
    return successResponse(
      res,
      { matchLog: updatedMatchLog },
      '직관 기록이 성공적으로 수정되었습니다.',
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const deleteMatchLog = async (req, res) => {
  try {
    const userId = req.user.userId;
    const matchLogId = parseInt(req.params.id);

    if (!matchLogId || matchLogId < 1) {
      return errorResponse(res, {
        statusCode: 400,
        code: 'COMMON_INVALID_INPUT',
        message: '올바른 직관 기록 ID를 입력해주세요.',
      });
    }

    await matchLogService.deleteMatchLog(matchLogId, userId);
    return successResponse(res, {}, '직관 기록이 성공적으로 삭제되었습니다.');
  } catch (error) {
    return errorResponse(res, error);
  }
};
