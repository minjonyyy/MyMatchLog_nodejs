import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Users, Gift, Clock } from "lucide-react";
import { useEvent, useEventParticipation } from "@/hooks/useEvents";
import {
  getEventStatus,
  getEventStatusColor,
  getEventStatusText,
} from "@/services/events";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const eventId = parseInt(id || "0");

  const { data: event, isLoading, error } = useEvent(eventId);
  const participationMutation = useEventParticipation();

  const handleParticipate = () => {
    if (event) {
      participationMutation.mutate(event.id);
    }
  };

  const handleBack = () => {
    navigate("/events");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              이벤트를 찾을 수 없습니다
            </h2>
            <p className="text-stone-600 mb-6">
              요청하신 이벤트가 존재하지 않거나 삭제되었습니다.
            </p>
            <Button
              onClick={handleBack}
              className="bg-amber-700 hover:bg-amber-800"
            >
              이벤트 목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const status = getEventStatus(event);
  const statusColor = getEventStatusColor(status);
  const statusText = getEventStatusText(status);
  const isFull = event.participant_count >= event.capacity;
  const canParticipate = status === "ongoing" && !isFull;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* 뒤로가기 버튼 */}
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-6 flex items-center gap-2 text-stone-700 hover:text-stone-900"
          >
            <ArrowLeft className="h-4 w-4" />
            이벤트 목록으로
          </Button>

          {/* 이벤트 상세 정보 */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                    {event.title}
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    {event.description}
                  </CardDescription>
                </div>
                <Badge
                  className={`ml-4 flex-shrink-0 text-sm px-3 py-1 ${statusColor}`}
                >
                  {statusText}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 이벤트 기간 */}
              <div className="flex items-center text-gray-700">
                <Calendar className="mr-3 h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">이벤트 기간</p>
                  <p className="text-sm text-gray-600">
                    {format(
                      new Date(event.start_at),
                      "yyyy년 MM월 dd일 HH:mm",
                      {
                        locale: ko,
                      },
                    )}{" "}
                    ~{" "}
                    {format(new Date(event.end_at), "MM월 dd일 HH:mm", {
                      locale: ko,
                    })}
                  </p>
                </div>
              </div>

              {/* 참여자 수 */}
              <div className="flex items-center text-gray-700">
                <Users className="mr-3 h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">참여자 현황</p>
                  <p className="text-sm text-gray-600">
                    {event.participant_count} / {event.capacity}명
                    {isFull && (
                      <span className="ml-2 text-red-600 font-medium">
                        (마감)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* 경품 정보 */}
              <div className="flex items-center text-gray-700">
                <Gift className="mr-3 h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">경품</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {event.gift}
                  </p>
                </div>
              </div>

              {/* 이벤트 상태에 따른 안내 */}
              {status === "upcoming" && (
                <div className="flex items-center text-blue-700 bg-blue-50 p-4 rounded-lg">
                  <Clock className="mr-3 h-5 w-5" />
                  <div>
                    <p className="font-medium">이벤트 시작 전</p>
                    <p className="text-sm">이벤트 시작 시간을 기다려주세요.</p>
                  </div>
                </div>
              )}

              {status === "ended" && (
                <div className="flex items-center text-gray-700 bg-gray-50 p-4 rounded-lg">
                  <Clock className="mr-3 h-5 w-5" />
                  <div>
                    <p className="font-medium">이벤트 종료</p>
                    <p className="text-sm">이 이벤트는 종료되었습니다.</p>
                  </div>
                </div>
              )}

              {isFull && status === "ongoing" && (
                <div className="flex items-center text-red-700 bg-red-50 p-4 rounded-lg">
                  <Users className="mr-3 h-5 w-5" />
                  <div>
                    <p className="font-medium">정원 마감</p>
                    <p className="text-sm">선착순 정원이 마감되었습니다.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 참여 신청 버튼 */}
          {canParticipate && (
            <div className="text-center">
              <Button
                onClick={handleParticipate}
                disabled={participationMutation.isPending}
                size="lg"
                className="px-8 py-3 text-lg"
              >
                {participationMutation.isPending
                  ? "처리 중..."
                  : "참여 신청하기"}
              </Button>
              <p className="text-sm text-gray-600 mt-2">
                선착순으로 참여 신청을 받고 있습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
