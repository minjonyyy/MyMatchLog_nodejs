import { createdResponse, errorResponse, successResponse } from '../../utils/response.util.js';
import * as userService from './user.service.js';

export const signUp = async (req, res) => {
  try {
    const { email, password, nickname } = req.body;
    const newUser = await userService.signUp(email, password, nickname);
    return createdResponse(res, { userId: newUser.id }, '회원가입이 완료되었습니다.');
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const tokens = await userService.login(email, password);
    return successResponse(res, tokens, '로그인에 성공했습니다.');
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const { accessToken } = await userService.refreshAccessToken(refreshToken);
    return successResponse(res, { accessToken }, 'Access Token이 성공적으로 갱신되었습니다.');
  } catch (error) {
    return errorResponse(res, error);
  }
};
