import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getMyInfo } from "@/services/auth";
import { getMatchLogs } from "@/services/matchLogs";
import { getTeams } from "@/services/matchLogs";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import {
  Calendar,
  MapPin,
  Trophy,
  TrendingUp,
  Clock,
  Plus,
  Heart,
} from "lucide-react";
import type { MatchLog } from "@/types/matchLogs";

interface UserInfo {
  id: number;
  email: string;
  nickname: string;
  favorite_team_id: number | null;
  created_at: string;
}

interface Team {
  id: number;
  name: string;
  city?: string;
}

const MyPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [userTeam, setUserTeam] = useState<Team | null>(null);

  // 사용자 정보 조회
  const { data: userInfo, isLoading: userLoading } = useQuery({
    queryKey: ["userInfo"],
    queryFn: getMyInfo,
    enabled: !!user,
  });

  // 직관 기록 목록 조회 (최근 5개)
  const { data: matchLogsData, isLoading: matchLogsLoading } = useQuery({
    queryKey: ["matchLogs", "recent"],
    queryFn: () => getMatchLogs({ page: 1, limit: 5 }),
    enabled: !!user,
  });

  // 팀 정보 조회
  const { data: teamsData } = useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
  });

  // 사용자의 응원팀 정보 설정
  useEffect(() => {
    if (userInfo?.data?.user && teamsData?.data?.teams) {
      const userTeamId = userInfo.data.user.favorite_team_id;
      if (userTeamId) {
        const team = teamsData.data.teams.find(
          (t: Team) => t.id === userTeamId,
        );
        setUserTeam(team || null);
      }
    }
  }, [userInfo, teamsData]);

  // 통계 계산
  const totalMatchLogs = matchLogsData?.data?.pagination?.totalCount || 0;
  const recentMatchLogs = matchLogsData?.data?.matchLogs || [];

  // 이번 달 직관 횟수 계산
  const thisMonthCount = recentMatchLogs.filter((log: MatchLog) => {
    const logDate = new Date(log.match_date);
    const now = new Date();
    return (
      logDate.getMonth() === now.getMonth() &&
      logDate.getFullYear() === now.getFullYear()
    );
  }).length;

  // 마이팀 직관 승률 계산
  const myTeamWinRate = useMemo(() => {
    if (!userTeam || totalMatchLogs === 0) return null;

    const myTeamMatches = recentMatchLogs.filter((log: MatchLog) => {
      return (
        log.home_team?.id === userTeam.id || log.away_team?.id === userTeam.id
      );
    });

    if (myTeamMatches.length === 0) return null;

    const wins = myTeamMatches.filter((log: MatchLog) => {
      if (log.home_team?.id === userTeam.id) {
        return log.result === "WIN";
      } else {
        return log.result === "LOSS";
      }
    }).length;

    return Math.round((wins / myTeamMatches.length) * 100);
  }, [userTeam, recentMatchLogs, totalMatchLogs]);

  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">마이페이지</h1>
        <p className="text-gray-600">나의 직관 기록과 통계를 확인해보세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 프로필 카드 */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="text-2xl bg-red-100 text-red-600">
                    {userInfo?.data?.user?.nickname?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">
                {userInfo?.data?.user?.nickname}
              </CardTitle>
              <p className="text-gray-500 text-sm">
                {userInfo?.data?.user?.email}
              </p>
              {userTeam && (
                <Badge variant="secondary" className="mt-2">
                  {userTeam.name} 팬
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">가입일</span>
                  <span className="font-medium">
                    {new Date(
                      userInfo?.data?.user?.created_at,
                    ).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">총 직관 횟수</span>
                  <span className="font-medium text-red-600">
                    {totalMatchLogs}회
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">이번 달 직관</span>
                  <span className="font-medium text-red-600">
                    {thisMonthCount}회
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate("/settings")}
              >
                프로필 설정
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 통계 및 최근 기록 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 통계 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Trophy className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">총 직관 횟수</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalMatchLogs}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">이번 달 직관</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {thisMonthCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">평균 월간</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalMatchLogs > 0
                        ? Math.round(
                            totalMatchLogs /
                              Math.max(
                                1,
                                Math.ceil(
                                  (Date.now() -
                                    new Date(
                                      userInfo?.data?.user?.created_at,
                                    ).getTime()) /
                                    (1000 * 60 * 60 * 24 * 30),
                                ),
                              ),
                          )
                        : 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 마이팀 승률 카드 */}
            {userTeam ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Trophy className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {userTeam.name} 승률
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {myTeamWinRate !== null ? `${myTeamWinRate}%` : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Heart className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">응원팀 설정</p>
                      <p className="text-sm text-gray-500 mb-2">
                        승률을 확인하려면 응원팀을 설정하세요
                      </p>
                      <Button
                        size="sm"
                        onClick={() => navigate("/settings")}
                        className="text-xs"
                      >
                        설정하러 가기
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 최근 직관 기록 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>최근 직관 기록</span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/match-logs")}
              >
                전체 보기
              </Button>
            </CardHeader>
            <CardContent>
              {matchLogsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : recentMatchLogs.length > 0 ? (
                <div className="space-y-4">
                  {recentMatchLogs.map((log: MatchLog) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/match-logs/${log.id}`)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <MapPin className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {log.home_team?.name} vs {log.away_team?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {log.stadium?.name} •{" "}
                            {new Date(log.match_date).toLocaleDateString(
                              "ko-KR",
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {log.result && (
                          <Badge
                            variant={
                              log.result === "WIN" ? "default" : "secondary"
                            }
                          >
                            {log.result === "WIN"
                              ? `${log.home_team?.name} 승`
                              : log.result === "LOSS"
                                ? `${log.away_team?.name} 승`
                                : log.result === "DRAW"
                                  ? "무승부"
                                  : "취소"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <MapPin className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    아직 직관 기록이 없습니다
                  </p>
                  <Button onClick={() => navigate("/match-logs/create")}>
                    <Plus className="w-4 h-4 mr-2" />첫 직관 기록 작성하기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
