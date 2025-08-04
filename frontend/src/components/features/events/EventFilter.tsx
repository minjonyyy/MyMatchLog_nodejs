import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { EventFilter as EventFilterType } from "@/types/events";

interface EventFilterProps {
  filter: EventFilterType;
  onFilterChange: (filter: EventFilterType) => void;
}

export const EventFilter: React.FC<EventFilterProps> = ({
  filter,
  onFilterChange,
}) => {
  const handleStatusChange = (status: string) => {
    onFilterChange({
      ...filter,
      status:
        status === "all"
          ? undefined
          : (status as "upcoming" | "ongoing" | "ended"),
    });
  };

  const handleSearchChange = (search: string) => {
    onFilterChange({
      ...filter,
      search: search || undefined,
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* 검색 */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="이벤트 검색..."
          value={filter.search || ""}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 bg-white border-gray-300"
        />
      </div>

      {/* 상태 필터 */}
      <Select value={filter.status || "all"} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full sm:w-[180px] bg-white border-gray-300">
          <SelectValue placeholder="상태 선택" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200">
          <SelectItem value="all" className="hover:bg-amber-50">
            전체
          </SelectItem>
          <SelectItem value="upcoming" className="hover:bg-amber-50">
            예정
          </SelectItem>
          <SelectItem value="ongoing" className="hover:bg-amber-50">
            진행중
          </SelectItem>
          <SelectItem value="ended" className="hover:bg-amber-50">
            종료
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
