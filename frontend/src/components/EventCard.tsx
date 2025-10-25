import { Link } from 'react-router-dom';
import { Calendar, Users, Trash2 } from 'lucide-react';
import type { EventData } from '../services/events';

interface EventCardProps {
  event: EventData;
  participantCount: number;
  onDelete: (eventId: string, eventName: string, e: React.MouseEvent) => void;
  onClick: () => void;
}

export default function EventCard({ event, participantCount, onDelete, onClick }: EventCardProps) {
  return (
    <div
      className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {event.name}
            </h3>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                event.status === 'finalized'
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-[#BEAEDB]/20 text-[#75619D]'
              }`}
            >
              {event.status === 'finalized' ? 'Completed' : 'Active'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{event.createdAt?.toDate?.().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) || 'No date'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>{participantCount} participants</span>
            </div>
            {event.eventType && (
              <span className="text-gray-400">{event.eventType.replace('_', ' ')}</span>
            )}
          </div>
        </div>

        <div className="text-right ml-4 hidden sm:block">
          <p className="text-xs text-gray-400 mb-1">
            Updated {event.updatedAt?.toDate?.().toLocaleDateString() || 'recently'}
          </p>
          <div className="flex items-center gap-3 justify-end">
            <Link
              to={`/event/${event.id}`}
              className="text-sm font-medium text-[#75619D] hover:text-[#75619D]/80 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              View →
            </Link>
            <button
              onClick={(e) => onDelete(event.id, event.name, e)}
              className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
              title="Delete event"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
