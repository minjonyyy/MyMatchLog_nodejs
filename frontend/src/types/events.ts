// 이벤트 관련 타입 정의

export interface Event {
  id: number;
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  gift: string;
  capacity: number;
  participant_count: number;
  created_at: string;
  updated_at: string;
}

export interface EventParticipation {
  id: number;
  user_id: number;
  event_id: number;
  status: "APPLIED" | "APPROVED" | "REJECTED";
  created_at: string;
}

export interface EventListResponse {
  events: Event[];
}

export interface EventDetailResponse {
  event: Event;
}

export interface EventParticipationResponse {
  participationId: number;
}

// 이벤트 상태 타입
export type EventStatus = "upcoming" | "ongoing" | "ended";

// 이벤트 필터 타입
export interface EventFilter {
  status?: EventStatus;
  search?: string;
}

// 이벤트 참여 가능 여부
export interface EventParticipationStatus {
  canParticipate: boolean;
  reason?: string;
  isParticipated: boolean;
}
