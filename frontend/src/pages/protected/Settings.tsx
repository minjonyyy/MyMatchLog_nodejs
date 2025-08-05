import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getMyInfo, updateMyInfo, changePassword } from "@/services/auth";
import { getTeams } from "@/services/matchLogs";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Shield,
  Heart,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 폼 상태
  const [nickname, setNickname] = useState("");
  const [favoriteTeamId, setFavoriteTeamId] = useState("none");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 에러 상태
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  // 사용자 정보 조회
  const { data: userInfo, isLoading: userLoading } = useQuery({
    queryKey: ["userInfo"],
    queryFn: getMyInfo,
    enabled: !!user,
  });

  // 팀 정보 조회
  const { data: teamsData, isLoading: teamsLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
  });

  // 사용자 정보가 로드되면 폼 초기값 설정
  useEffect(() => {
    if (userInfo?.data?.user) {
      setNickname(userInfo.data.user.nickname || "");
      setFavoriteTeamId(
        userInfo.data.user.favorite_team_id?.toString() || "none",
      );
    }
  }, [userInfo]);

  // 프로필 수정 뮤테이션
  const updateProfileMutation = useMutation({
    mutationFn: updateMyInfo,
    onSuccess: (data) => {
      toast({
        title: "프로필 수정 완료",
        description: "프로필이 성공적으로 수정되었습니다.",
      });

      // 사용자 정보 캐시 업데이트
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });

      // 로컬 상태 업데이트
      if (data.data?.user) {
        setUser(data.data.user);
      }
    },
    onError: (error: any) => {
      toast({
        title: "프로필 수정 실패",
        description:
          error.response?.data?.message || "프로필 수정에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // 프로필 수정 핸들러
  const handleProfileSubmit = () => {
    const updateData: any = {
      nickname: nickname,
    };

    if (favoriteTeamId !== "none") {
      updateData.favorite_team_id = parseInt(favoriteTeamId);
    } else {
      updateData.favorite_team_id = null;
    }

    updateProfileMutation.mutate(updateData);
  };

  // 비밀번호 변경 뮤테이션
  const changePasswordMutation = useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast({
        title: "비밀번호 변경 완료! 🎉",
        description:
          "비밀번호가 성공적으로 변경되었습니다. 다음 로그인부터 새 비밀번호를 사용하세요.",
      });

      // 폼 초기화
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // 에러 상태 초기화
      setPasswordErrors({});

      // 비밀번호 표시 상태 초기화
      setShowPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "비밀번호 변경에 실패했습니다.";
      const errorCode = error.response?.data?.code;

      let errorField = "general";
      let errorText = errorMessage;

      // 백엔드 에러 코드에 따른 구체적인 메시지
      switch (errorCode) {
        case "USER_PASSWORD_MISMATCH":
          errorField = "currentPassword";
          errorText = "현재 비밀번호가 일치하지 않습니다.";
          break;
        case "COMMON_INVALID_INPUT":
          errorField = "newPassword";
          errorText =
            "비밀번호는 영문 대소문자, 숫자, 특수문자를 포함한 8자 이상이어야 합니다.";
          break;
        case "USER_NOT_FOUND":
          errorField = "general";
          errorText = "사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.";
          break;
        default:
          errorField = "general";
          errorText = errorMessage;
      }

      setPasswordErrors({ [errorField]: errorText });
    },
  });

  // 비밀번호 변경 핸들러
  const handlePasswordSubmit = () => {
    // 에러 상태 초기화
    setPasswordErrors({});

    // 1. 필수 필드 검증
    if (!currentPassword) {
      setPasswordErrors({ currentPassword: "현재 비밀번호를 입력해주세요." });
      return;
    }

    if (!newPassword) {
      setPasswordErrors({ newPassword: "새 비밀번호를 입력해주세요." });
      return;
    }

    if (!confirmPassword) {
      setPasswordErrors({
        confirmPassword: "새 비밀번호 확인을 입력해주세요.",
      });
      return;
    }

    // 2. 비밀번호 일치 검증
    if (newPassword !== confirmPassword) {
      setPasswordErrors({
        confirmPassword: "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.",
      });
      return;
    }

    // 3. 비밀번호 정규식 검증 (상세한 피드백)
    if (newPassword.length < 8) {
      setPasswordErrors({
        newPassword: "비밀번호는 최소 8자 이상이어야 합니다.",
      });
      return;
    }

    if (!/(?=.*[a-z])/.test(newPassword)) {
      setPasswordErrors({
        newPassword: "비밀번호에 영문 소문자를 포함해주세요.",
      });
      return;
    }

    if (!/(?=.*[A-Z])/.test(newPassword)) {
      setPasswordErrors({
        newPassword: "비밀번호에 영문 대문자를 포함해주세요.",
      });
      return;
    }

    if (!/(?=.*\d)/.test(newPassword)) {
      setPasswordErrors({ newPassword: "비밀번호에 숫자를 포함해주세요." });
      return;
    }

    if (!/(?=.*[@$!%*?&])/.test(newPassword)) {
      setPasswordErrors({
        newPassword: "비밀번호에 특수문자(@$!%*?&)를 포함해주세요.",
      });
      return;
    }

    // 4. 현재 비밀번호와 새 비밀번호가 같은지 확인
    if (currentPassword === newPassword) {
      setPasswordErrors({
        newPassword: "새 비밀번호는 현재 비밀번호와 달라야 합니다.",
      });
      return;
    }

    // 모든 검증 통과 시 API 호출
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  // 사용자의 응원팀 정보
  const userTeam = teamsData?.data?.teams?.find(
    (team: any) => team.id === userInfo?.data?.user?.favorite_team_id,
  );

  if (userLoading || teamsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100">
      <div className="container mx-auto px-4 py-12">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate("/mypage")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            마이페이지로 돌아가기
          </Button>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-stone-900 mb-4">설정</h1>
          <p className="text-xl text-stone-600">
            계정 정보와 프로필을 관리하세요
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          {/* 프로필 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>프로필 설정</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="nickname" className="text-base font-medium">
                    닉네임
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="nickname"
                      placeholder="닉네임을 입력하세요"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="favorite_team"
                    className="text-base font-medium"
                  >
                    응원팀
                  </Label>
                  <div className="mt-2">
                    <Select
                      value={favoriteTeamId}
                      onValueChange={setFavoriteTeamId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="응원팀을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">응원팀 없음</SelectItem>
                        {teamsData?.data?.teams?.map((team: any) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    현재 응원팀:{" "}
                    {userTeam ? (
                      <Badge variant="secondary">{userTeam.name}</Badge>
                    ) : (
                      <span className="text-gray-400">설정되지 않음</span>
                    )}
                  </div>
                  <Button
                    onClick={handleProfileSubmit}
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      "저장 중..."
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        저장
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 비밀번호 변경 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>비밀번호 변경</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label
                    htmlFor="currentPassword"
                    className="text-base font-medium"
                  >
                    현재 비밀번호
                  </Label>
                  <div className="mt-2">
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="현재 비밀번호를 입력하세요"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={
                          passwordErrors.currentPassword ? "border-red-500" : ""
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-sm text-red-500 mt-1">
                        {passwordErrors.currentPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="newPassword"
                    className="text-base font-medium"
                  >
                    새 비밀번호
                  </Label>
                  <div className="mt-2">
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="새 비밀번호를 입력하세요"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={
                          passwordErrors.newPassword ? "border-red-500" : ""
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-red-500 mt-1">
                        {passwordErrors.newPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="text-base font-medium"
                  >
                    새 비밀번호 확인
                  </Label>
                  <div className="mt-2">
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="새 비밀번호를 다시 입력하세요"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={
                          passwordErrors.confirmPassword ? "border-red-500" : ""
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">
                        {passwordErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {passwordErrors.general && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <p className="text-sm text-red-600">
                      {passwordErrors.general}
                    </p>
                  </div>
                )}

                <p className="text-sm text-gray-600 text-center">
                  비밀번호는 영문 대소문자, 숫자, 특수문자를 포함한 8자 이상으로
                  설정해주세요.
                </p>

                <div className="flex justify-end">
                  <Button
                    onClick={handlePasswordSubmit}
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending ? (
                      "변경 중..."
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        비밀번호 변경
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 계정 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>계정 정보</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">이메일</span>
                  <span className="font-medium">
                    {userInfo?.data?.user?.email}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">가입일</span>
                  <span className="font-medium">
                    {new Date(
                      userInfo?.data?.user?.created_at,
                    ).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">응원팀</span>
                  <span className="font-medium">
                    {userTeam ? (
                      <Badge variant="secondary">{userTeam.name}</Badge>
                    ) : (
                      <span className="text-gray-400">설정되지 않음</span>
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
