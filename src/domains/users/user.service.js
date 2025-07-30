import bcrypt from 'bcrypt';
import { BadRequestError, ConflictError } from '../../errors/http.error.js';
import * as userRepository from './user.repository.js';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const signUp = async (email, password, nickname) => {
  if (!email || !EMAIL_REGEX.test(email)) {
    throw new BadRequestError('유효한 이메일 형식이 아닙니다.', 'COMMON_INVALID_INPUT');
  }
  if (!password || !PASSWORD_REGEX.test(password)) {
    throw new BadRequestError(
      '비밀번호는 8자 이상이며, 대/소문자, 숫자, 특수문자(@$!%*?&)를 모두 포함해야 합니다.',
      'COMMON_INVALID_INPUT'
    );
  }
  if (!nickname) {
    throw new BadRequestError('닉네임을 입력해주세요.', 'COMMON_INVALID_INPUT');
  }

  const existingUserByEmail = await userRepository.findUserByEmail(email);
  if (existingUserByEmail) {
    throw new ConflictError('이미 사용 중인 이메일입니다.', 'USER_EMAIL_DUPLICATE');
  }

  const existingUserByNickname = await userRepository.findUserByNickname(nickname);
  if (existingUserByNickname) {
    throw new ConflictError('이미 사용 중인 닉네임입니다.', 'USER_NICKNAME_DUPLICATE');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await userRepository.createUser(email, hashedPassword, nickname);
  return newUser;
};
