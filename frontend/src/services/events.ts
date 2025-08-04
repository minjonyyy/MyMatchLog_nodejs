import api from "./api";
import type {
  EventListResponse,
  EventDetailResponse,
  EventParticipationResponse,
  Event,
  EventFilter,
} from "../types/events";
import type { ApiResponse } from "../types/api";

/**
 * 진행 중인 이벤트 목록을 조회합니다.
 */
export const getEvents = async (): Promise<EventListResponse> => {
  const response = await api.get<ApiResponse<EventListResponse>>("/events");
  return response.data.data;
};

/**
 * 특정 이벤트의 상세 정보를 조회합니다.
 * @param eventId - 이벤트 ID
 */
export const getEventById = async (eventId: number): Promise<Event> => {
  const response = await api.get<ApiResponse<{ event: Event }>>(
    `/events/${eventId}`,
  );
  return response.data.data.event;
};

/**
 * 이벤트에 참여 신청합니다.
 * @param eventId - 이벤트 ID
 */
export const participateInEvent = async (
  eventId: number,
): Promise<EventParticipationResponse> => {
  const response = await api.post<ApiResponse<EventParticipationResponse>>(
    `/events/${eventId}/participate`,
  );
  return response.data.data;
};

/**
 * 이벤트 목록을 필터링합니다.
 * @param events - 이벤트 목록
 * @param filter - 필터 조건
 */
export const filterEvents = (events: Event[], filter: EventFilter): Event[] => {
  let filteredEvents = [...events];

  // 상태별 필터링
  if (filter.status) {
    const now = new Date();
    filteredEvents = filteredEvents.filter((event) => {
      const startDate = new Date(event.start_at);
      const endDate = new Date(event.end_at);

      switch (filter.status) {
        case "upcoming":
          return startDate > now;
        case "ongoing":
          return startDate <= now && endDate >= now;
        case "ended":
          return endDate < now;
        default:
          return true;
      }
    });
  }

  // 검색 필터링
  if (filter.search) {
    const searchTerm = filter.search.toLowerCase();
    filteredEvents = filteredEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.gift.toLowerCase().includes(searchTerm),
    );
  }

  return filteredEvents;
};

/**
 * 이벤트의 참여 가능 여부를 확인합니다.
 * @param event - 이벤트 정보
 * @param isParticipated - 이미 참여했는지 여부
 */
export const checkEventParticipationStatus = (
  event: Event,
  isParticipated: boolean = false,
): { canParticipate: boolean; reason?: string } => {
  const now = new Date();
  const startDate = new Date(event.start_at);
  const endDate = new Date(event.end_at);

  // 이미 참여한 경우
  if (isParticipated) {
    return { canParticipate: false, reason: "이미 참여한 이벤트입니다." };
  }

  // 이벤트 기간이 아닌 경우
  if (now < startDate) {
    return { canParticipate: false, reason: "이벤트 시작 전입니다." };
  }

  if (now > endDate) {
    return { canParticipate: false, reason: "이벤트가 종료되었습니다." };
  }

  // 정원이 마감된 경우
  if (event.participant_count >= event.capacity) {
    return { canParticipate: false, reason: "선착순 정원이 마감되었습니다." };
  }

  return { canParticipate: true };
};

/**
 * 이벤트 상태를 계산합니다.
 * @param event - 이벤트 정보
 */
export const getEventStatus = (
  event: Event,
): "upcoming" | "ongoing" | "ended" => {
  const now = new Date();
  const startDate = new Date(event.start_at);
  const endDate = new Date(event.end_at);

  if (now < startDate) return "upcoming";
  if (now > endDate) return "ended";
  return "ongoing";
};

/**
 * 이벤트 상태에 따른 색상을 반환합니다.
 * @param status - 이벤트 상태
 */
export const getEventStatusColor = (
  status: "upcoming" | "ongoing" | "ended",
): string => {
  switch (status) {
    case "upcoming":
      return "bg-blue-100 text-blue-800";
    case "ongoing":
      return "bg-green-100 text-green-800";
    case "ended":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * 이벤트 상태에 따른 텍스트를 반환합니다.
 * @param status - 이벤트 상태
 */
export const getEventStatusText = (
  status: "upcoming" | "ongoing" | "ended",
): string => {
  switch (status) {
    case "upcoming":
      return "예정";
    case "ongoing":
      return "진행중";
    case "ended":
      return "종료";
    default:
      return "알 수 없음";
  }
};
