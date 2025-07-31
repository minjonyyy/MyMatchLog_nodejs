import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../../errors/http.error.js';
import * as matchLogRepository from './matchlog.repository.js';
import * as teamRepository from '../teams/team.repository.js';
import * as stadiumRepository from '../stadiums/stadium.repository.js';

// 팀 존재 여부 검증 헬퍼 함수
const validateTeamExists = async (teamId) => {
  const teams = await teamRepository.findAllTeams();
  const teamExists = teams.some((team) => team.id === teamId);

  if (!teamExists) {
    throw new BadRequestError(
      `팀 ID ${teamId}는 존재하지 않습니다.`,
      'COMMON_INVALID_INPUT',
    );
  }
};

// 경기장 존재 여부 검증 헬퍼 함수
const validateStadiumExists = async (stadiumId) => {
  const stadium = await stadiumRepository.findStadiumById(stadiumId);
  if (!stadium) {
    throw new BadRequestError(
      `경기장 ID ${stadiumId}는 존재하지 않습니다.`,
      'COMMON_INVALID_INPUT',
    );
  }
};

// 경기 날짜 검증 헬퍼 함수 (미래 날짜 제한)
const validateMatchDate = (matchDate) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // 오늘의 마지막 시간

  const inputDate = new Date(matchDate);

  if (inputDate > today) {
    throw new BadRequestError(
      '시작 이전의 경기는 기록할 수 없습니다. 오늘까지의 경기만 기록 가능합니다.',
      'INVALID_MATCH_DATE',
    );
  }
};

export const getMyMatchLogs = async (userId, page = 1, limit = 10) => {
  // 페이지네이션 계산
  const offset = (page - 1) * limit;

  // 직관 기록 목록과 총 개수 조회
  const [matchLogs, totalCount] = await Promise.all([
    matchLogRepository.findMatchLogsByUserId(userId, limit, offset),
    matchLogRepository.countMatchLogsByUserId(userId),
  ]);

  // 페이지네이션 정보 계산
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    matchLogs,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage,
      hasPrevPage,
      limit,
    },
  };
};

export const getMatchLogDetail = async (matchLogId, userId) => {
  const matchLog = await matchLogRepository.findMatchLogById(matchLogId);

  if (!matchLog) {
    throw new NotFoundError(
      '해당 직관 기록을 찾을 수 없습니다.',
      'MATCH_LOG_NOT_FOUND',
    );
  }

  // 소유권 검증 - 본인의 기록만 조회 가능
  if (matchLog.user_id !== userId) {
    throw new ForbiddenError(
      '해당 기록에 대한 접근 권한이 없습니다.',
      'MATCH_INVALID_OWNER',
    );
  }

  return matchLog;
};

export const createMatchLog = async (userId, matchLogData) => {
  const {
    match_date,
    home_team_id,
    away_team_id,
    stadium_id,
    result,
    memo,
    ticket_image_url,
  } = matchLogData;

  // 필수 필드 검증
  if (!match_date || !home_team_id || !away_team_id || !stadium_id) {
    throw new BadRequestError(
      '경기 날짜, 홈팀, 원정팀, 경기장은 필수 입력 항목입니다.',
      'COMMON_INVALID_INPUT',
    );
  }

  // 팀 ID 타입 검증
  if (!Number.isInteger(home_team_id) || !Number.isInteger(away_team_id)) {
    throw new BadRequestError(
      '홈팀과 원정팀 ID는 정수여야 합니다.',
      'COMMON_INVALID_INPUT',
    );
  }

  // 경기장 ID 타입 검증
  if (!Number.isInteger(stadium_id)) {
    throw new BadRequestError(
      '경기장 ID는 정수여야 합니다.',
      'COMMON_INVALID_INPUT',
    );
  }

  // 같은 팀끼리 경기 불가 검증
  if (home_team_id === away_team_id) {
    throw new BadRequestError(
      '홈팀과 원정팀은 같을 수 없습니다.',
      'COMMON_INVALID_INPUT',
    );
  }

  // 경기 날짜 검증 (미래 날짜 제한)
  validateMatchDate(match_date);

  // 팀 ID 존재 여부 검증
  await validateTeamExists(home_team_id);
  await validateTeamExists(away_team_id);

  // 경기장 ID 존재 여부 검증
  await validateStadiumExists(stadium_id);

  // 경기 결과 유효성 검증
  if (result && !['WIN', 'LOSS', 'DRAW'].includes(result)) {
    throw new BadRequestError(
      '경기 결과는 WIN, LOSS, DRAW 중 하나여야 합니다.',
      'COMMON_INVALID_INPUT',
    );
  }

  const newMatchLog = await matchLogRepository.createMatchLog({
    user_id: userId,
    match_date,
    home_team_id,
    away_team_id,
    stadium_id,
    result,
    memo,
    ticket_image_url,
  });

  return newMatchLog;
};

export const updateMatchLog = async (matchLogId, userId, updateData) => {
  // 기존 기록 조회 및 소유권 검증
  const existingMatchLog =
    await matchLogRepository.findMatchLogById(matchLogId);

  if (!existingMatchLog) {
    throw new NotFoundError(
      '해당 직관 기록을 찾을 수 없습니다.',
      'MATCH_LOG_NOT_FOUND',
    );
  }

  if (existingMatchLog.user_id !== userId) {
    throw new ForbiddenError(
      '해당 기록에 대한 수정 권한이 없습니다.',
      'MATCH_INVALID_OWNER',
    );
  }

  // 경기 날짜 검증 (미래 날짜 제한)
  if (updateData.match_date) {
    validateMatchDate(updateData.match_date);
  }

  // 팀 ID 유효성 검증
  if (
    updateData.home_team_id !== undefined ||
    updateData.away_team_id !== undefined
  ) {
    const homeTeamId = updateData.home_team_id ?? existingMatchLog.home_team.id;
    const awayTeamId = updateData.away_team_id ?? existingMatchLog.away_team.id;

    // 팀 ID 타입 검증
    if (
      updateData.home_team_id !== undefined &&
      !Number.isInteger(updateData.home_team_id)
    ) {
      throw new BadRequestError(
        '홈팀 ID는 정수여야 합니다.',
        'COMMON_INVALID_INPUT',
      );
    }
    if (
      updateData.away_team_id !== undefined &&
      !Number.isInteger(updateData.away_team_id)
    ) {
      throw new BadRequestError(
        '원정팀 ID는 정수여야 합니다.',
        'COMMON_INVALID_INPUT',
      );
    }

    // 같은 팀끼리 경기 불가 검증
    if (homeTeamId === awayTeamId) {
      throw new BadRequestError(
        '홈팀과 원정팀은 같을 수 없습니다.',
        'COMMON_INVALID_INPUT',
      );
    }

    // 팀 ID 존재 여부 검증
    if (updateData.home_team_id !== undefined) {
      await validateTeamExists(updateData.home_team_id);
    }
    if (updateData.away_team_id !== undefined) {
      await validateTeamExists(updateData.away_team_id);
    }
  }

  // 경기장 ID 유효성 검증
  if (updateData.stadium_id !== undefined) {
    // 경기장 ID 타입 검증
    if (!Number.isInteger(updateData.stadium_id)) {
      throw new BadRequestError(
        '경기장 ID는 정수여야 합니다.',
        'COMMON_INVALID_INPUT',
      );
    }

    // 경기장 ID 존재 여부 검증
    await validateStadiumExists(updateData.stadium_id);
  }

  // 경기 결과 유효성 검증
  if (
    updateData.result &&
    !['WIN', 'LOSS', 'DRAW'].includes(updateData.result)
  ) {
    throw new BadRequestError(
      '경기 결과는 WIN, LOSS, DRAW 중 하나여야 합니다.',
      'COMMON_INVALID_INPUT',
    );
  }

  await matchLogRepository.updateMatchLog(matchLogId, updateData);

  // 업데이트된 기록 반환
  const updatedMatchLog = await matchLogRepository.findMatchLogById(matchLogId);
  return updatedMatchLog;
};

export const deleteMatchLog = async (matchLogId, userId) => {
  // 기존 기록 조회 및 소유권 검증
  const existingMatchLog =
    await matchLogRepository.findMatchLogById(matchLogId);

  if (!existingMatchLog) {
    throw new NotFoundError(
      '해당 직관 기록을 찾을 수 없습니다.',
      'MATCH_LOG_NOT_FOUND',
    );
  }

  if (existingMatchLog.user_id !== userId) {
    throw new ForbiddenError(
      '해당 기록에 대한 삭제 권한이 없습니다.',
      'MATCH_INVALID_OWNER',
    );
  }

  await matchLogRepository.deleteMatchLog(matchLogId);
};
