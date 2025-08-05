import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../../services/admin";
import { Plus, Edit, Trash2, Eye, Search, Calendar, Users } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  prize: string;
}

const EventManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    maxParticipants: 100,
    prize: "",
  });

  // 이벤트 목록 조회
  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: getEvents,
  });

  // 이벤트 생성
  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "이벤트 생성 완료",
        description: "새로운 이벤트가 성공적으로 생성되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "이벤트 생성 실패",
        description:
          error.response?.data?.message ||
          "이벤트 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // 이벤트 수정
  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EventFormData }) =>
      updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setEditingEvent(null);
      resetForm();
      toast({
        title: "이벤트 수정 완료",
        description: "이벤트가 성공적으로 수정되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "이벤트 수정 실패",
        description:
          error.response?.data?.message ||
          "이벤트 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // 이벤트 삭제
  const deleteEventMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast({
        title: "이벤트 삭제 완료",
        description: "이벤트가 성공적으로 삭제되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "이벤트 삭제 실패",
        description:
          error.response?.data?.message ||
          "이벤트 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      maxParticipants: 100,
      prize: "",
    });
  };

  const handleCreateEvent = () => {
    createEventMutation.mutate(formData);
  };

  const handleUpdateEvent = () => {
    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent.id, data: formData });
    }
  };

  const handleDeleteEvent = (eventId: number) => {
    if (window.confirm("정말로 이 이벤트를 삭제하시겠습니까?")) {
      deleteEventMutation.mutate(eventId);
    }
  };

  const openEditDialog = (event: any) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      startDate: event.startDate.split("T")[0],
      endDate: event.endDate.split("T")[0],
      maxParticipants: event.maxParticipants,
      prize: event.prize,
    });
  };

  const filteredEvents =
    events?.filter(
      (event: any) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-700 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin"></div>
          </div>
          <div className="text-stone-600 font-medium">
            <div className="text-lg mb-2">이벤트 데이터 로딩 중...</div>
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
            🎉 이벤트 관리
          </h1>
          <p className="text-stone-600">
            플랫폼의 모든 이벤트를 관리하고 새로운 이벤트를 생성하세요
          </p>
        </div>

        {/* 검색 및 필터 */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
            <Input
              placeholder="이벤트 제목이나 설명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                <Plus className="w-4 h-4 mr-2" />새 이벤트 생성
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>새 이벤트 생성</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">이벤트 제목</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="이벤트 제목을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="description">이벤트 설명</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="이벤트 설명을 입력하세요"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">시작일</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">종료일</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxParticipants">최대 참여자 수</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxParticipants: parseInt(e.target.value),
                        })
                      }
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prize">상품</Label>
                    <Input
                      id="prize"
                      value={formData.prize}
                      onChange={(e) =>
                        setFormData({ ...formData, prize: e.target.value })
                      }
                      placeholder="상품 정보"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleCreateEvent}
                    disabled={createEventMutation.isPending}
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                  >
                    {createEventMutation.isPending
                      ? "생성 중..."
                      : "이벤트 생성"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="flex-1"
                  >
                    취소
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 이벤트 목록 */}
        <div className="grid gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event: any) => (
              <Card key={event.id} className="bg-white shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-stone-800">
                          {event.title}
                        </h3>
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
                      </div>
                      <p className="text-stone-600 mb-4">{event.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-stone-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(event.startDate).toLocaleDateString()} -{" "}
                            {new Date(event.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-stone-600">
                          <Users className="w-4 h-4" />
                          <span>
                            참여자: {event.participantCount || 0}/
                            {event.maxParticipants}
                          </span>
                        </div>
                        <div className="text-sm text-stone-600">
                          <span>상품: {event.prize}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/admin/events/${event.id}/participants`)
                        }
                        className="text-amber-600 hover:text-amber-700"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        참여자
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(event)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        수정
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        삭제
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-12 text-center">
                <p className="text-stone-500 text-lg">
                  등록된 이벤트가 없습니다.
                </p>
                <p className="text-stone-400 mt-2">
                  새로운 이벤트를 생성해보세요!
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 수정 다이얼로그 */}
        <Dialog
          open={!!editingEvent}
          onOpenChange={() => setEditingEvent(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>이벤트 수정</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">이벤트 제목</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="이벤트 제목을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">이벤트 설명</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="이벤트 설명을 입력하세요"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-startDate">시작일</Label>
                  <Input
                    id="edit-startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-endDate">종료일</Label>
                  <Input
                    id="edit-endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-maxParticipants">최대 참여자 수</Label>
                  <Input
                    id="edit-maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxParticipants: parseInt(e.target.value),
                      })
                    }
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-prize">상품</Label>
                  <Input
                    id="edit-prize"
                    value={formData.prize}
                    onChange={(e) =>
                      setFormData({ ...formData, prize: e.target.value })
                    }
                    placeholder="상품 정보"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleUpdateEvent}
                  disabled={updateEventMutation.isPending}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                >
                  {updateEventMutation.isPending ? "수정 중..." : "이벤트 수정"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingEvent(null)}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EventManagement;
