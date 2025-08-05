import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEventParticipants,
  announceEventResults,
} from "../../services/admin";
import { getEventById } from "../../services/events";
import {
  ArrowLeft,
  Search,
  Users,
  Calendar,
  Trophy,
  Download,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const ParticipantManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // 이벤트 상세 정보 조회
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ["event-detail", id],
    queryFn: () => getEventById(parseInt(id!)),
    enabled: !!id,
  });

  // 참여자 목록 조회
  const { data: participants, isLoading: participantsLoading } = useQuery({
    queryKey: ["event-participants", id],
    queryFn: () => getEventParticipants(parseInt(id!)),
    enabled: !!id,
  });

  // 이벤트 결과 발표
  const announceResultsMutation = useMutation({
    mutationFn: () => announceEventResults(parseInt(id!)),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["event-participants", id] });
      queryClient.invalidateQueries({ queryKey: ["event-detail", id] });
      toast({
        title: "결과 발표 완료",
        description: `총 ${data.totalParticipants}명 중 ${data.winners}명이 당첨되었습니다.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "결과 발표 실패",
        description:
          error.response?.data?.message || "결과 발표 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const isLoading = eventLoading || participantsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-700 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin"></div>
          </div>
          <div className="text-stone-600 font-medium">
            <div className="text-lg mb-2">참여자 데이터 로딩 중...</div>
            <div className="text-sm">잠시만 기다려주세요</div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-600 text-lg">이벤트를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const filteredParticipants =
    participants?.filter((participant: any) => {
      const matchesSearch =
        participant.user.nickname
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        participant.user.email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || participant.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPLIED":
        return <Badge className="bg-blue-100 text-blue-800">신청완료</Badge>;
      case "WON":
        return <Badge className="bg-green-100 text-green-800">당첨</Badge>;
      case "LOST":
        return <Badge className="bg-red-100 text-red-800">미당첨</Badge>;
      default:
        return (
          <Badge className="bg-stone-100 text-stone-600">알 수 없음</Badge>
        );
    }
  };

  const getStatusCount = (status: string) => {
    return participants?.filter((p: any) => p.status === status).length || 0;
  };

  const canAnnounceResults =
    new Date(event.end_at) < new Date() && getStatusCount("APPLIED") > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin/events")}
              className="text-stone-600 hover:text-stone-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              이벤트 목록으로
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">
            👥 참여자 관리
          </h1>
          <p className="text-stone-600">
            이벤트 참여자 현황을 확인하고 관리하세요
          </p>
        </div>

        {/* 이벤트 정보 */}
        <Card className="bg-white shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-stone-800">
              {event.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-stone-500" />
                <div>
                  <p className="text-sm text-stone-600">기간</p>
                  <p className="font-medium text-stone-800">
                    {new Date(event.start_at).toLocaleDateString()} -{" "}
                    {new Date(event.end_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-stone-500" />
                <div>
                  <p className="text-sm text-stone-600">참여자</p>
                  <p className="font-medium text-stone-800">
                    {event.participant_count || 0} / {event.capacity}명
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-stone-500" />
                <div>
                  <p className="text-sm text-stone-600">상품</p>
                  <p className="font-medium text-stone-800">{event.gift}</p>
                </div>
              </div>
            </div>
            <p className="text-stone-600 mt-4">{event.description}</p>
          </CardContent>
        </Card>

        {/* 통계 및 액션 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {getStatusCount("APPLIED")}
              </div>
              <p className="text-sm text-stone-600">신청완료</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {getStatusCount("WON")}
              </div>
              <p className="text-sm text-stone-600">당첨</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {getStatusCount("LOST")}
              </div>
              <p className="text-sm text-stone-600">미당첨</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-stone-600">
                {participants?.length || 0}
              </div>
              <p className="text-sm text-stone-600">총 참여자</p>
            </CardContent>
          </Card>
        </div>

        {/* 결과 발표 버튼 */}
        {canAnnounceResults && (
          <div className="mb-6">
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-1">
                      결과 발표 준비 완료
                    </h3>
                    <p className="text-sm text-amber-700">
                      이벤트가 종료되었습니다. 참여 순서에 따라 당첨자를 선정할
                      수 있습니다.
                    </p>
                  </div>
                  <Button
                    onClick={() => announceResultsMutation.mutate()}
                    disabled={announceResultsMutation.isPending}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {announceResultsMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        발표 중...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        결과 발표
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 검색 및 필터 */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
            <Input
              placeholder="닉네임이나 이메일로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">전체 상태</option>
            <option value="APPLIED">신청완료</option>
            <option value="WON">당첨</option>
            <option value="LOST">미당첨</option>
          </select>
          <Button
            variant="outline"
            onClick={() => {
              // CSV 다운로드 기능 (실제 구현 시)
              toast({
                title: "다운로드 준비 중",
                description: "참여자 목록 다운로드 기능은 준비 중입니다.",
              });
            }}
            className="border-amber-200 text-amber-700 hover:bg-amber-50"
          >
            <Download className="w-4 h-4 mr-2" />
            목록 다운로드
          </Button>
        </div>

        {/* 참여자 목록 */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-stone-800">
              참여자 목록 ({filteredParticipants.length}명)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredParticipants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="text-left py-3 px-4 font-medium text-stone-700">
                        순서
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-stone-700">
                        닉네임
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-stone-700">
                        이메일
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-stone-700">
                        응원팀
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-stone-700">
                        참여일시
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-stone-700">
                        상태
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParticipants.map(
                      (participant: any, index: number) => (
                        <tr
                          key={participant.id}
                          className="border-b border-stone-100 hover:bg-stone-50"
                        >
                          <td className="py-3 px-4 text-stone-600">
                            {participant.participationOrder || index + 1}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-stone-800">
                              {participant.user.nickname || "닉네임 없음"}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-stone-600">
                            {participant.user.email}
                          </td>
                          <td className="py-3 px-4 text-stone-600">
                            {participant.user.favoriteTeamName || "설정 안함"}
                          </td>
                          <td className="py-3 px-4 text-stone-600">
                            {new Date(participant.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(participant.status)}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                <p className="text-stone-500 text-lg">참여자가 없습니다.</p>
                <p className="text-stone-400 mt-2">
                  아직 이 이벤트에 참여한 사용자가 없습니다.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParticipantManagement;
