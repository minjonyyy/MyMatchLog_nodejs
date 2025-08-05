import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Gift } from "lucide-react";
import type { Event } from "@/types/events";
import {
  getEventStatus,
  getEventStatusColor,
  getEventStatusText,
} from "@/services/events";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigate = useNavigate();
  const status = getEventStatus(event);
  const statusColor = getEventStatusColor(status);
  const statusText = getEventStatusText(status);

  const handleCardClick = () => {
    navigate(`/events/${event.id}`);
  };

  return (
    <Card
      className="h-full transition-all duration-200 hover:shadow-lg cursor-pointer bg-white"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
              {event.title}
            </CardTitle>
            <CardDescription className="mt-2 text-sm text-gray-600 line-clamp-2">
              {event.description}
            </CardDescription>
          </div>
          <Badge className={`ml-2 flex-shrink-0 ${statusColor}`}>
            {statusText}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 이벤트 기간 */}
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="mr-2 h-4 w-4" />
          <span>
            {format(new Date(event.start_at), "yyyy.MM.dd HH:mm", {
              locale: ko,
            })}{" "}
            ~ {format(new Date(event.end_at), "MM.dd HH:mm", { locale: ko })}
          </span>
        </div>

        {/* 이벤트 대상자 */}
        <div className="flex items-center text-sm text-gray-600">
          <Users className="mr-2 h-4 w-4" />
          <span>선착순 {event.capacity}명</span>
        </div>

        {/* 경품 정보 */}
        <div className="flex items-center text-sm text-gray-600">
          <Gift className="mr-2 h-4 w-4" />
          <span className="font-medium text-gray-800">{event.gift}</span>
        </div>
      </CardContent>
    </Card>
  );
};
