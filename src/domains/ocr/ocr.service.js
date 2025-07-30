import BaseError from '../../errors/base.error.js';
import { findAllTeams } from '../teams/team.repository.js';
import { findAllStadiums } from '../stadiums/stadium.repository.js';

/**
 * 티켓 이미지에서 OCR을 통해 경기 정보를 추출합니다.
 * @param {Object} file - 업로드된 파일 객체
 * @returns {Object} 추출된 경기 정보
 */
export const parseTicketImage = async (file) => {
  try {
    // 1. OCR API 호출하여 텍스트 추출
    const extractedText = await callOCRAPI(file);
    
    // 2. 추출된 텍스트에서 경기 정보 파싱
    const parsedInfo = parseTicketText(extractedText);
    
    // 3. 파싱된 정보가 유효한지 검증
    if (!parsedInfo) {
      return null;
    }

    // 4. 팀명과 경기장명을 실제 DB 데이터와 매칭
    const validatedInfo = await validateAndMatchInfo(parsedInfo);
    
    return validatedInfo;
  } catch (error) {
    console.error('OCR 처리 중 오류:', error);
    // OCR 실패 시에도 null을 반환하여 클라이언트가 처리할 수 있도록 함
    return null;
  }
};

  /**
   * 외부 OCR API를 호출하여 이미지에서 텍스트를 추출합니다.
   * @param {Object} file - 업로드된 파일 객체
   * @returns {string} 추출된 텍스트
   */
  const callOCRAPI = async (file) => {
    // TODO: 실제 OCR API 연동 (Naver Clova, Google Vision 등)
    // 현재는 실제 이미지 파일을 확인하여 테스트합니다.
    
    console.log('OCR API 호출 - 파일:', file.originalname);
    
    // // test_ticket_img.jpg 파일인 경우에만 모의 데이터 반환
    // if (file.originalname === 'test_ticket_img.jpg') {
    //   const mockOCRResult = `
    //     경기일: 2024-07-21
    //     경기장: 잠실야구장
    //     홈팀: LG 트윈스
    //     원정팀: 두산 베어스
    //     경기시간: 18:30
    //   `;
    //   return mockOCRResult;
    // }
    
    // 다른 파일들은 OCR 실패로 처리
    throw new Error('OCR 인식 실패');
  };

/**
 * OCR로 추출된 텍스트에서 경기 정보를 파싱합니다.
 * @param {string} text - OCR로 추출된 텍스트
 * @returns {Object|null} 파싱된 경기 정보
 */
const parseTicketText = (text) => {
  try {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    const parsedInfo = {};
    
    for (const line of lines) {
      if (line.includes('경기일:') || line.includes('날짜:')) {
        const dateMatch = line.match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          parsedInfo.match_date = dateMatch[1];
        }
      }
      
      if (line.includes('경기장:') || line.includes('구장:')) {
        const stadiumMatch = line.match(/경기장:\s*(.+)/) || line.match(/구장:\s*(.+)/);
        if (stadiumMatch) {
          parsedInfo.stadium = stadiumMatch[1].trim();
        }
      }
      
      if (line.includes('홈팀:') || line.includes('홈:')) {
        const homeTeamMatch = line.match(/홈팀:\s*(.+)/) || line.match(/홈:\s*(.+)/);
        if (homeTeamMatch) {
          parsedInfo.home_team = homeTeamMatch[1].trim();
        }
      }
      
      if (line.includes('원정팀:') || line.includes('원정:') || line.includes('어웨이:')) {
        const awayTeamMatch = line.match(/원정팀:\s*(.+)/) || line.match(/원정:\s*(.+)/) || line.match(/어웨이:\s*(.+)/);
        if (awayTeamMatch) {
          parsedInfo.away_team = awayTeamMatch[1].trim();
        }
      }
    }
    
    // 최소한의 필수 정보가 있는지 확인
    if (parsedInfo.match_date && parsedInfo.stadium && parsedInfo.home_team && parsedInfo.away_team) {
      return parsedInfo;
    }
    
    return null;
  } catch (error) {
    console.error('텍스트 파싱 중 오류:', error);
    return null;
  }
};

/**
 * 파싱된 정보를 실제 DB 데이터와 매칭하여 검증합니다.
 * @param {Object} parsedInfo - 파싱된 경기 정보
 * @returns {Object} 검증된 경기 정보
 */
const validateAndMatchInfo = async (parsedInfo) => {
  try {
    // 1. 경기장 정보 매칭
    const stadiums = await findAllStadiums();
    const matchedStadium = stadiums.find(stadium => 
      stadium.name.includes(parsedInfo.stadium) || 
      parsedInfo.stadium.includes(stadium.name)
    );
    
    // 2. 팀 정보 매칭
    const teams = await findAllTeams();
    const matchedHomeTeam = teams.find(team => 
      team.name.includes(parsedInfo.home_team) || 
      parsedInfo.home_team.includes(team.name)
    );
    
    const matchedAwayTeam = teams.find(team => 
      team.name.includes(parsedInfo.away_team) || 
      parsedInfo.away_team.includes(team.name)
    );
    
    // 3. 매칭 결과 구성
    const result = {
      match_date: parsedInfo.match_date,
      confidence: 0.85, // OCR 신뢰도 (실제로는 OCR API에서 제공)
      stadium: matchedStadium ? {
        id: matchedStadium.id,
        name: matchedStadium.name,
        city: matchedStadium.city
      } : null,
      home_team: matchedHomeTeam ? {
        id: matchedHomeTeam.id,
        name: matchedHomeTeam.name
      } : null,
      away_team: matchedAwayTeam ? {
        id: matchedAwayTeam.id,
        name: matchedAwayTeam.name
      } : null
    };
    
    // 4. 매칭 실패 시 원본 텍스트도 포함
    if (!matchedStadium) {
      result.stadium_text = parsedInfo.stadium;
    }
    if (!matchedHomeTeam) {
      result.home_team_text = parsedInfo.home_team;
    }
    if (!matchedAwayTeam) {
      result.away_team_text = parsedInfo.away_team;
    }
    
    return result;
  } catch (error) {
    console.error('정보 매칭 중 오류:', error);
    // 매칭 실패 시에도 기본 정보는 반환
    return {
      match_date: parsedInfo.match_date,
      confidence: 0.0,
      stadium_text: parsedInfo.stadium,
      home_team_text: parsedInfo.home_team,
      away_team_text: parsedInfo.away_team
    };
  }
};
