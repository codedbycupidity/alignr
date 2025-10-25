import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, AlertCircle, Loader2, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { getEvent, addParticipant } from '../services/events';
import type { EventData } from '../services/events';

export default function JoinEvent() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventData | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!eventId) {
      setError('Invalid event link');
      setLoading(false);
      return;
    }

    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const eventData = await getEvent(eventId!);

      if (!eventData) {
        setError('Event not found');
      } else if (!eventData.isPublic) {
        setError('This event is private');
      } else {
        setEvent(eventData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId || !event) return;

    setError('');
    setSubmitting(true);

    try {
      await addParticipant(eventId, name, undefined, password || undefined);
      navigate(`/event/${eventId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#75619D] animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 bg-red-100 rounded-md flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{error}</h2>
          <p className="text-sm text-gray-500 mb-6">
            The event you're trying to join is not available
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#75619D] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#75619D]/90 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo and brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8 group">
            <div className="w-10 h-10 bg-[#75619D] rounded-md flex items-center justify-center transition-colors">
              <Calendar className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <span className="text-2xl font-semibold text-[#75619D]">Alignr</span>
          </Link>
        </div>

        {/* Event info card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6"
        >
          <div className="bg-[#BEAEDB]/10 px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              You've been invited!
            </h1>
            <p className="text-sm text-gray-600">
              Join <span className="font-semibold text-[#75619D]">{event?.name}</span>
            </p>
          </div>

          <div className="px-6 py-4">
            {event?.description && (
              <p className="text-sm text-gray-600 mb-4">{event.description}</p>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
              {event?.createdAt && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Created {event.createdAt.toDate().toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Organized by {event?.organizerName || 'Event Host'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Join form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-lg overflow-hidden"
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Join this event
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                    placeholder:text-gray-400
                    focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent
                    transition-colors"
                  placeholder="Enter your name"
                  required
                  autoFocus
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  This is how other participants will see you
                </p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                    placeholder:text-gray-400
                    focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent
                    transition-colors"
                  placeholder="Create a password (optional)"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Set a password to protect your responses from being edited by others
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || !name.trim()}
                className="w-full bg-[#75619D] text-white py-2 px-4 rounded-md text-sm font-medium
                  hover:bg-[#75619D]/90
                  transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Event'
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          By joining, you agree to share your availability with the event organizer
        </p>
      </div>
    </div>
  );
}
