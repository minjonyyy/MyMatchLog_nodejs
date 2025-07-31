import { successResponse, errorResponse } from '../../utils/response.util.js';
import * as teamService from './team.service.js';

export const getAllTeams = async (req, res) => {
  try {
    const teams = await teamService.getAllTeams();
    return successResponse(res, { teams }, '팀 목록 조회에 성공했습니다.');
  } catch (error) {
    return errorResponse(res, error);
  }
};
