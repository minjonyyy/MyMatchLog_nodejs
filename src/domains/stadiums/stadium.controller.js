import * as stadiumService from './stadium.service.js';
import { successResponse, errorResponse } from '../../utils/response.util.js';

export const getAllStadiums = async (req, res) => {
  try {
    const stadiums = await stadiumService.getAllStadiums();
    return successResponse(
      res,
      { stadiums },
      '경기장 목록 조회에 성공했습니다.',
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getStadiumById = async (req, res) => {
  try {
    const stadiumId = parseInt(req.params.id);
    const stadium = await stadiumService.getStadiumById(stadiumId);
    return successResponse(res, { stadium }, '경기장 조회에 성공했습니다.');
  } catch (error) {
    return errorResponse(res, error);
  }
};
