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
import {
  useEvent,
  useEventParticipation,
  useParticipationStatus,
} from "@/hooks/useEvents";
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
  const { data: participationData } = useParticipationStatus(eventId);

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
  const canParticipate = status === "ongoing"; // 정원 마감 여부와 관계없이 참여 가능

  // 참여 상태 확인
  const participation = participationData?.participation;
  const isParticipated = !!participation;
  const participationStatus = participation?.status;

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

              {/* 이벤트 대상자 수 */}
              <div className="flex items-center text-gray-700">
                <Users className="mr-3 h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">이벤트 대상자</p>
                  <p className="text-sm text-gray-600">
                    선착순 {event.capacity}명
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
            </CardContent>
          </Card>

          {/* 참여 신청 버튼 */}
          {canParticipate && !isParticipated && (
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
                선착순 참여 이벤트입니다. 결과는 이벤트 종료 후 마이페이지에서
                확인해주세요.
              </p>
            </div>
          )}

          {/* 참여 완료 상태 */}
          {isParticipated && (
            <div className="text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  참여 완료
                </h3>
                <p className="text-blue-700 mb-4">
                  이벤트 참여가 완료되었습니다.
                </p>
                {participationStatus === "APPLIED" && (
                  <p className="text-sm text-blue-600">
                    결과는 이벤트 종료 후 마이페이지에서 확인해주세요.
                  </p>
                )}
                {participationStatus === "WON" && (
                  <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">🎉 당첨!</p>
                    <p className="text-sm text-green-700">
                      참여 순서: {participation?.participation_order}번째
                    </p>
                  </div>
                )}
                {participationStatus === "LOST" && (
                  <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-800 font-medium">😢 미당첨</p>
                    <p className="text-sm text-gray-700">
                      참여 순서: {participation?.participation_order}번째
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
