import React, { useState } from "react";
import { EventCard } from "@/components/features/events/EventCard";
import { EventFilter } from "@/components/features/events/EventFilter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import type { EventFilter as EventFilterType } from "@/types/events";
import { useNavigate } from "react-router-dom";

export const Events: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<EventFilterType>({});

  const { data: events, isLoading, error } = useEvents();

  const handleFilterChange = (newFilter: EventFilterType) => {
    setFilter(newFilter);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">이벤트 목록</h2>
          <p className="text-gray-600">
            이벤트를 불러오는 중 오류가 발생했습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100">
      <div className="container mx-auto px-4 py-12">
        {/* 헤더 섹션 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-stone-900 mb-4">이벤트</h1>
          <p className="text-xl text-stone-600 mb-8">
            다양한 야구 이벤트에 참여하고 특별한 혜택을 받아보세요!
          </p>
        </div>

        {/* 필터 및 검색 섹션 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 max-w-4xl mx-auto">
          <EventFilter filter={filter} onFilterChange={handleFilterChange} />
        </div>

        {/* 이벤트 목록 */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-80 bg-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              진행 중인 이벤트가 없습니다
            </h3>
            <p className="text-gray-600">
              새로운 이벤트가 등록되면 알려드릴게요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
