import {
  createdResponse,
  errorResponse,
  successResponse,
} from '../../utils/response.util.js';
import * as userService from './user.service.js';

export const signUp = async (req, res) => {
  try {
    const { email, password, nickname } = req.body;
    const result = await userService.signUp(email, password, nickname);
    return createdResponse(
      res,
      { 
        userId: result.user.id,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      },
      '회원가입이 완료되었습니다.',
    );
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

export const logout = async (req, res) => {
  try {
    const userId = req.user.userId; // auth 미들웨어에서 설정된 사용자 ID
    const result = await userService.logout(userId);
    return successResponse(res, result, '로그아웃이 완료되었습니다.');
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const { accessToken } = await userService.refreshAccessToken(refreshToken);
    return successResponse(
      res,
      { accessToken },
      'Access Token이 성공적으로 갱신되었습니다.',
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getUserMe = async (req, res) => {
  try {
    const userId = req.user.userId; // auth 미들웨어에서 설정된 사용자 ID
    const userInfo = await userService.getUserMe(userId);
    return successResponse(
      res,
      { user: userInfo },
      '내 정보 조회에 성공했습니다.',
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const updateUserMe = async (req, res) => {
  try {
    const userId = req.user.userId; // auth 미들웨어에서 설정된 사용자 ID
    const updateData = req.body;
    const updatedUser = await userService.updateUserMe(userId, updateData);
    return successResponse(
      res,
      { user: updatedUser },
      '사용자 정보가 성공적으로 수정되었습니다.',
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};
