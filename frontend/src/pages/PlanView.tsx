import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  Share2,
  CheckCircle2,
  Edit
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getEvent } from '../services/events';
import { getEventAvailability } from '../services/availability';
import type { EventData } from '../services/events';
import type { ParticipantAvailability } from '../types/availability';
import AvailabilityHeatmap from '../components/AvailabilityHeatmap';

export default function PlanView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventData | null>(null);
  const [availability, setAvailability] = useState<ParticipantAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadEventData = async () => {
      try {
        console.log('Loading event:', id);

        // Load event and availability in parallel
        const [eventData, availabilityData] = await Promise.all([
          getEvent(id),
          getEventAvailability(id)
        ]);

        if (eventData) {
          setEvent(eventData);
          console.log('Event organizer:', eventData.organizerId);
          console.log('Current user:', user?.id);
        }

        setAvailability(availabilityData);
      } catch (error) {
        console.error('Error loading event data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [id, user]);

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/join/${id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B61FF] mb-4"></div>
          <p className="text-lg font-semibold text-[#1E1E2F]">Loading plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFB] via-white to-[#F5F3FF]">

      {/* Top bar */}
      <nav className="bg-white/70 backdrop-blur-md border-b border-white/20 px-6 py-3 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 bg-[#75619D] rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Calendar className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-[#1E1E2F] tracking-tight">Alignr</span>
          </Link>

          <div className="flex items-center gap-3">
            {user?.id === event?.organizerId && (
              <Link
                to={`/event/${id}/edit`}
                className="flex items-center space-x-2 px-4 py-2.5 bg-white/60 backdrop-blur-sm border border-[#75619D]/30 text-[#75619D] hover:bg-white/80 hover:border-[#75619D]/50 rounded-lg transition-all duration-300 text-sm font-medium shadow-sm"
              >
                <Edit className="w-4 h-4" strokeWidth={2} />
                <span>Edit</span>
              </Link>
            )}
            <Link
              to={`/join/${id}`}
              className="flex items-center space-x-2 px-4 py-2.5 bg-[#75619D] text-white hover:bg-[#75619D]/90 rounded-lg transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md"
            >
              <Users className="w-4 h-4" strokeWidth={2} />
              <span>Join Event</span>
            </Link>
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white/60 backdrop-blur-sm border border-[#75619D]/30 text-[#75619D] hover:bg-white/80 hover:border-[#75619D]/50 rounded-lg transition-all duration-300 text-sm font-medium shadow-sm"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" strokeWidth={2} />
                  <span>Share Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/*Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Event Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-[#75619D] rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1E1E2F] tracking-tight">{event?.name || 'Loading...'}</h1>
              {event?.description && (
                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
              )}
            </div>
          </div>
          {event?.selectedDates && event.selectedDates.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-[#75619D]" />
              <span>
                {event.selectedDates.length} {event.selectedDates.length === 1 ? 'date' : 'dates'} selected
              </span>
              {availability.length > 0 && (
                <>
                  <span className="text-gray-400">•</span>
                  <Users className="w-4 h-4 text-[#75619D]" />
                  <span>
                    {availability.length} {availability.length === 1 ? 'participant' : 'participants'}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Availability Heatmap */}
        {event && event.selectedDates && event.selectedDates.length > 0 && (
          <div>
            <AvailabilityHeatmap
              availability={availability}
              dates={event.selectedDates}
              startTime={event.startTime || '09:00'}
              endTime={event.endTime || '17:00'}
              intervalMinutes={30}
            />
          </div>
        )}
      </main>
    </div>
  );
}