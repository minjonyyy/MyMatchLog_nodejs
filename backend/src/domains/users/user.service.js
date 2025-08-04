import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../../errors/http.error.js';
import * as userRepository from './user.repository.js';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const signUp = async (email, password, nickname) => {
  if (!email || !EMAIL_REGEX.test(email)) {
    throw new BadRequestError(
      '유효한 이메일 형식이 아닙니다.',
      'COMMON_INVALID_INPUT',
    );
  }
  if (!password || !PASSWORD_REGEX.test(password)) {
    throw new BadRequestError(
      '비밀번호는 8자 이상이며, 대/소문자, 숫자, 특수문자(@$!%*?&)를 모두 포함해야 합니다.',
      'COMMON_INVALID_INPUT',
    );
  }
  if (!nickname) {
    throw new BadRequestError('닉네임을 입력해주세요.', 'COMMON_INVALID_INPUT');
  }

  const existingUserByEmail = await userRepository.findUserByEmail(email);
  if (existingUserByEmail) {
    throw new ConflictError(
      '이미 사용 중인 이메일입니다.',
      'USER_EMAIL_DUPLICATE',
    );
  }

  const existingUserByNickname =
    await userRepository.findUserByNickname(nickname);
  if (existingUserByNickname) {
    throw new ConflictError(
      '이미 사용 중인 닉네임입니다.',
      'USER_NICKNAME_DUPLICATE',
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await userRepository.createUser(
    email,
    hashedPassword,
    nickname,
  );
  return newUser;
};

export const login = async (email, password) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new NotFoundError(
      '해당 사용자를 찾을 수 없습니다.',
      'USER_NOT_FOUND',
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError(
      '비밀번호가 일치하지 않습니다.',
      'USER_PASSWORD_MISMATCH',
    );
  }

  // 이미 로그인된 사용자인지 확인 (refresh_token이 있는 경우)
  if (user.refresh_token) {
    throw new ConflictError(
      '이미 로그인된 상태입니다. 로그아웃 후 다시 시도해주세요.',
      'USER_ALREADY_LOGGED_IN',
    );
  }

  // JWT 토큰에 관리자 권한 정보 포함
  const tokenPayload = {
    userId: user.id,
    isAdmin: user.is_admin || false,
  };

  const accessToken = jwt.sign(
    tokenPayload,
    process.env.ACCESS_TOKEN_SECRET_KEY,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '1h',
    },
  );

  const refreshToken = jwt.sign(
    tokenPayload,
    process.env.REFRESH_TOKEN_SECRET_KEY,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '14d',
    },
  );

  await userRepository.updateRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken };
};

export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new UnauthorizedError('Refresh Token이 필요합니다.');
  }

  try {
    // 1. Refresh Token 검증
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET_KEY,
    );

    // 2. DB에서 사용자 정보 조회
    const user = await userRepository.findUserById(decoded.userId);

    //3. DB에 저장된 토큰과 일치하는지 확인 - String으로 변환하여 비교
    if (!user || String(user.refresh_token) !== refreshToken) {
      throw new UnauthorizedError(
        '유효하지 않거나 만료된 Refresh Token입니다.',
      );
    }

    // 4. 새로운 Access Token 발급
    const newAccessToken = jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET_KEY,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '1h',
      },
    );

    return { accessToken: newAccessToken };
  } catch {
    // JWT 만료 또는 서명 오류 등
    throw new UnauthorizedError('유효하지 않거나 만료된 Refresh Token입니다.');
  }
};

export const getUserMe = async (userId) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new NotFoundError(
      '해당 사용자를 찾을 수 없습니다.',
      'USER_NOT_FOUND',
    );
  }

  // 비밀번호와 refresh_token은 응답에서 제외
  const userInfo = { ...user };
  delete userInfo.password;
  delete userInfo.refresh_token;
  return userInfo;
};

export const logout = async (userId) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new NotFoundError(
      '해당 사용자를 찾을 수 없습니다.',
      'USER_NOT_FOUND',
    );
  }

  // refresh_token 제거
  await userRepository.updateRefreshToken(userId, null);
  
  return { message: '로그아웃이 완료되었습니다.' };
};

export const updateUserMe = async (userId, updateData) => {
  const { nickname, favorite_team_id } = updateData;

  // 업데이트할 데이터가 없으면 에러
  if (!nickname && !favorite_team_id) {
    throw new BadRequestError(
      '업데이트할 정보를 입력해주세요.',
      'COMMON_INVALID_INPUT',
    );
  }

  // 닉네임 중복 검사 (기존 사용자 제외)
  if (nickname) {
    const existingUser = await userRepository.findUserByNickname(nickname);
    if (existingUser && existingUser.id !== userId) {
      throw new ConflictError(
        '이미 사용 중인 닉네임입니다.',
        'USER_NICKNAME_DUPLICATE',
      );
    }
  }

  // 사용자 정보 업데이트
  await userRepository.updateUser(userId, { nickname, favorite_team_id });

  // 업데이트된 사용자 정보 조회
  const updatedUser = await userRepository.findUserById(userId);
  const userInfo = { ...updatedUser };
  delete userInfo.password;
  delete userInfo.refresh_token;

  return userInfo;
};
