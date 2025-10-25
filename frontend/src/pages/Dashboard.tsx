import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Plus, Users, Clock, CheckCircle2, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserEvents, getParticipants } from '../services/events';
import type { EventData } from '../services/events';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadEvents();
  }, [user]);

  const loadEvents = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userEvents = await getUserEvents(user.id);
      setEvents(userEvents);

      // Load participant counts for each event
      const counts: Record<string, number> = {};
      for (const event of userEvents) {
        const participants = await getParticipants(event.id);
        counts[event.id] = participants.length;
      }
      setParticipantCounts(counts);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="border-b border-gray-200 sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#75619D] rounded-md flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <span className="text-lg font-semibold text-[#75619D]">Alignr</span>
            </Link>

            {/* User section */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {user?.name ? `${user.name}'s Plans` : 'Plans'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage all your events in one place
            </p>
          </div>
          <Link
            to="/event/create"
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-[#75619D] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#75619D]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

          {/* Total plans */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#BEAEDB] transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Plans
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {events.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                <Calendar className="w-6 h-6 text-gray-600" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Active plans */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#BEAEDB] transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {events.filter(e => e.status === 'draft' || e.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                <Clock className="w-6 h-6 text-gray-600" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Finalized plans */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#BEAEDB] transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Completed
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {events.filter(e => e.status === 'finalized').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-gray-600" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* Events list */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">
              Your Plans
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">No events yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Create your first event to get started
              </p>
              <Link
                to="/event/create"
                className="inline-flex items-center gap-2 bg-[#75619D] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#75619D]/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/event/${event.id}`)}
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
                          <span>{participantCounts[event.id] || 0} participants</span>
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
                      <Link
                        to={`/event/${event.id}`}
                        className="text-sm font-medium text-[#75619D] hover:text-[#75619D]/80 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
