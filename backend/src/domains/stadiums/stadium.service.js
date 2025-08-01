import * as stadiumRepository from './stadium.repository.js';

export const getAllStadiums = async () => {
  return await stadiumRepository.findAllStadiums();
};

export const getStadiumById = async (id) => {
  const stadium = await stadiumRepository.findStadiumById(id);
  if (!stadium) {
    throw {
      statusCode: 404,
      code: 'STADIUM_NOT_FOUND',
      message: '존재하지 않는 경기장입니다.',
    };
  }
  return stadium;
};

export const validateStadiumExists = async (stadiumId) => {
  const stadium = await stadiumRepository.findStadiumById(stadiumId);
  if (!stadium) {
    throw {
      statusCode: 400,
      code: 'STADIUM_NOT_FOUND',
      message: '존재하지 않는 경기장입니다.',
    };
  }
  return stadium;
};
