import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAdminStats, getRecentEvents } from "../../services/admin";
import { Calendar, Users, Trophy, TrendingUp, Eye, Plus } from "lucide-react";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // 관리자 통계 데이터 조회
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
  });

  // 최근 이벤트 목록 조회
  const { data: recentEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["recent-events"],
    queryFn: getRecentEvents,
  });

  const isLoading = statsLoading || eventsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-700 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin"></div>
          </div>
          <div className="text-stone-600 font-medium">
            <div className="text-lg mb-2">관리자 데이터 로딩 중...</div>
            <div className="text-sm">잠시만 기다려주세요</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">
            👑 관리자 대시보드
          </h1>
          <p className="text-stone-600">
            MyMatchLog 플랫폼 전체 현황을 한눈에 확인하세요
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-stone-600 flex items-center">
                <Users className="w-4 h-4 mr-2" />총 사용자
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-stone-800">
                {stats?.totalUsers?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-stone-500 mt-1">
                이번 달 +{stats?.newUsersThisMonth || 0}명
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-stone-600 flex items-center">
                <Trophy className="w-4 h-4 mr-2" />총 이벤트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-stone-800">
                {stats?.totalEvents?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-stone-500 mt-1">
                진행 중 {stats?.activeEvents || 0}개
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-stone-600 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />총 직관 기록
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-stone-800">
                {stats?.totalMatchLogs?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-stone-500 mt-1">
                이번 달 +{stats?.newMatchLogsThisMonth || 0}개
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-stone-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                평균 참여율
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-stone-800">
                {stats?.averageParticipationRate || 0}%
              </div>
              <p className="text-xs text-stone-500 mt-1">
                지난 달 대비 {stats?.participationRateChange || 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 빠른 액션 */}
        <div className="mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-stone-800">
                빠른 액션
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => navigate("/admin/events")}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />새 이벤트 생성
                </Button>
                <Button
                  onClick={() => navigate("/events")}
                  variant="outline"
                  className="border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  이벤트 목록 보기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 최근 이벤트 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-stone-800">
                최근 이벤트
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentEvents && recentEvents.length > 0 ? (
                <div className="space-y-4">
                  {recentEvents.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 bg-stone-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-stone-800">
                          {event.title}
                        </h4>
                        <p className="text-sm text-stone-600">
                          {new Date(event.startDate).toLocaleDateString()} -{" "}
                          {new Date(event.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            event.status === "ACTIVE" ? "default" : "secondary"
                          }
                          className={
                            event.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-stone-100 text-stone-600"
                          }
                        >
                          {event.status === "ACTIVE" ? "진행중" : "종료"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/events/${event.id}/participants`)
                          }
                          className="text-amber-600 hover:text-amber-700"
                        >
                          참여자 보기
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-500 text-center py-8">
                  등록된 이벤트가 없습니다.
                </p>
              )}
            </CardContent>
          </Card>

          {/* 사용자 활동 현황 */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-stone-800">
                사용자 활동 현황
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <div>
                    <p className="font-medium text-stone-800">오늘 방문자</p>
                    <p className="text-sm text-stone-600">새로운 사용자 활동</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-stone-800">
                      {stats?.todayVisitors || 0}
                    </p>
                    <p className="text-xs text-stone-500">명</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <div>
                    <p className="font-medium text-stone-800">
                      이번 주 직관 기록
                    </p>
                    <p className="text-sm text-stone-600">새로 작성된 기록</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-stone-800">
                      {stats?.thisWeekMatchLogs || 0}
                    </p>
                    <p className="text-xs text-stone-500">개</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <div>
                    <p className="font-medium text-stone-800">
                      이번 달 이벤트 참여
                    </p>
                    <p className="text-sm text-stone-600">총 참여 횟수</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-stone-800">
                      {stats?.thisMonthParticipations || 0}
                    </p>
                    <p className="text-xs text-stone-500">회</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
