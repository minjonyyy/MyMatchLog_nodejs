import * as teamRepository from './team.repository.js';

export const getAllTeams = async () => {
  const teams = await teamRepository.findAllTeams();
  return teams;
};
