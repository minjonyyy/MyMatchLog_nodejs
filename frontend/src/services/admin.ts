import api from "./api";

// 관리자 통계 데이터 타입
export interface AdminStats {
  totalUsers: number;
  newUsersThisMonth: number;
  totalEvents: number;
  activeEvents: number;
  totalMatchLogs: number;
  newMatchLogsThisMonth: number;
  averageParticipationRate: number;
  participationRateChange: number;
  todayVisitors: number;
  thisWeekMatchLogs: number;
  thisMonthParticipations: number;
}

// 이벤트 생성/수정 데이터 타입
export interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  prize: string;
}

// 참여자 정보 타입
export interface Participant {
  id: number;
  userId: number;
  eventId: number;
  status: "APPLIED" | "WON" | "LOST";
  participationOrder: number;
  createdAt: string;
  user: {
    id: number;
    email: string;
    nickname: string;
    favoriteTeamName?: string;
  };
}

// 결과 발표 응답 타입
export interface AnnounceResultsResponse {
  totalParticipants: number;
  winners: number;
  losers: number;
}

// 관리자 대시보드 통계 조회
export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get("/admin/stats");
  return response.data;
};

// 최근 이벤트 목록 조회
export const getRecentEvents = async () => {
  const response = await api.get("/admin/events/recent");
  return response.data;
};

// 모든 이벤트 목록 조회 (관리자용)
export const getEvents = async () => {
  const response = await api.get("/admin/events");
  return response.data;
};

// 이벤트 생성
export const createEvent = async (eventData: EventFormData) => {
  const response = await api.post("/admin/events", eventData);
  return response.data;
};

// 이벤트 수정
export const updateEvent = async (
  eventId: number,
  eventData: EventFormData,
) => {
  const response = await api.patch(`/admin/events/${eventId}`, eventData);
  return response.data;
};

// 이벤트 삭제
export const deleteEvent = async (eventId: number) => {
  const response = await api.delete(`/admin/events/${eventId}`);
  return response.data;
};

// 이벤트 참여자 목록 조회
export const getEventParticipants = async (
  eventId: number,
): Promise<Participant[]> => {
  const response = await api.get(`/admin/events/${eventId}/participants`);
  return response.data;
};

// 이벤트 결과 발표
export const announceEventResults = async (
  eventId: number,
): Promise<AnnounceResultsResponse> => {
  const response = await api.post(`/admin/events/${eventId}/announce-results`);
  return response.data;
};
