import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEvents,
  getEventById,
  participateInEvent,
  filterEvents,
  checkEventParticipationStatus,
  getEventStatus,
} from "../services/events";
import type { Event, EventFilter } from "../types/events";
import { useToast } from "./use-toast";

// Query Keys
export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (filters: EventFilter) => [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (id: number) => [...eventKeys.details(), id] as const,
};

/**
 * 이벤트 목록을 조회하는 훅
 */
export const useEvents = (filters: EventFilter = {}) => {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: getEvents,
    select: (data) => filterEvents(data.events, filters),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};

/**
 * 특정 이벤트 상세 정보를 조회하는 훅
 */
export const useEvent = (eventId: number) => {
  return useQuery({
    queryKey: eventKeys.detail(eventId),
    queryFn: () => getEventById(eventId),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};

/**
 * 이벤트 참여 신청 훅
 */
export const useEventParticipation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: participateInEvent,
    onSuccess: (data, eventId) => {
      // 이벤트 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });

      // 특정 이벤트 상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });

      toast({
        title: "참여 신청 완료",
        description: "이벤트 참여 신청이 완료되었습니다. 결과를 기다려주세요.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "이벤트 참여 신청에 실패했습니다.";

      toast({
        title: "참여 신청 실패",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

/**
 * 이벤트 참여 가능 여부를 확인하는 훅
 */
export const useEventParticipationStatus = (
  event: Event | undefined,
  isParticipated: boolean = false,
) => {
  if (!event) {
    return {
      canParticipate: false,
      reason: "이벤트 정보를 불러올 수 없습니다.",
    };
  }

  return checkEventParticipationStatus(event, isParticipated);
};

/**
 * 이벤트 상태를 계산하는 훅
 */
export const useEventStatus = (event: Event | undefined) => {
  if (!event) return null;
  return getEventStatus(event);
};

/**
 * 이벤트 목록을 필터링하는 훅
 */
export const useFilteredEvents = (
  events: Event[] | undefined,
  filters: EventFilter,
) => {
  if (!events) return [];
  return filterEvents(events, filters);
};
