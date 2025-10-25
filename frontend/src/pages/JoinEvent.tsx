import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, AlertCircle, Loader2, Users, Clock, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Timestamp } from 'firebase/firestore';
import { getEvent, addParticipant, findParticipantByName, verifyParticipantPassword, getBlocks } from '../services/events';
import type { EventData } from '../services/events';
import type { TimeSlot } from '../types/availability';
import type { TimeBlock } from '../types/block';
import AvailabilityGrid from '../components/AvailabilityGrid';

export default function JoinEvent() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventData | null>(null);
  const [timeBlock, setTimeBlock] = useState<TimeBlock | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [initialAvailability, setInitialAvailability] = useState<TimeSlot[]>([]);
  const [existingParticipantId, setExistingParticipantId] = useState<string | null>(null);
  const [step, setStep] = useState<'info' | 'availability'>('info');
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

        // Load blocks to find TimeBlock with availability mode
        const blocks = await getBlocks(eventId!);
        const timeBlockData = blocks.find(
          (block): block is TimeBlock => {
            if (block.type === 'time') {
              const tb = block as TimeBlock;
              return tb.content.mode === 'availability';
            }
            return false;
          }
        );

        if (timeBlockData) {
          setTimeBlock(timeBlockData);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !eventId) return;

    setError('');
    setSubmitting(true);

    try {
      // Check if participant name already exists
      const existingParticipant = await findParticipantByName(eventId, name.trim());

      if (existingParticipant) {
        // Name already exists
        if (existingParticipant.password) {
          // Password is set - verify it
          if (!password) {
            setError('This name is already taken and password-protected. Please enter the password to edit your availability.');
            setSubmitting(false);
            return;
          }

          if (!verifyParticipantPassword(existingParticipant, password)) {
            setError('Incorrect password for this name.');
            setSubmitting(false);
            return;
          }
        }
        // If no password is set, allow editing without password

        // Load existing availability for this participant from TimeBlock
        console.log('Loading existing availability for participant:', existingParticipant.id);
        setExistingParticipantId(existingParticipant.id);

        if (timeBlock && timeBlock.content.availability) {
          const participantAvailability = timeBlock.content.availability.find(
            a => a.participantId === existingParticipant.id
          );

          if (participantAvailability && participantAvailability.timeSlots) {
            console.log('Found existing availability:', participantAvailability.timeSlots.length, 'slots');
            setInitialAvailability(participantAvailability.timeSlots);
          }
        }
      }

      // Name available or password verified - proceed to availability
      setStep('availability');
    } catch (err) {
      console.error('Error checking participant:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify participant');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async () => {
    if (!eventId || !event || !timeBlock) return;

    setError('');
    setSubmitting(true);

    try {
      let participantId: string;

      if (existingParticipantId) {
        // Updating existing participant - use their ID
        participantId = existingParticipantId;
        console.log('Updating existing participant:', participantId);
      } else {
        // New participant - create them
        participantId = await addParticipant(eventId, name.trim(), undefined, password || undefined);
        console.log('New participant added:', participantId);
      }

      // Save availability to TimeBlock
      const availableSlots = availability.filter(slot => slot.available);
      console.log('=== SAVING AVAILABILITY ===');
      console.log('Available slots:', availableSlots.length, 'slots');
      console.log('TimeBlock ID:', timeBlock.id);
      console.log('Participant ID:', participantId);
      console.log('Participant Name:', name.trim());

      // Update the TimeBlock's availability array
      const currentAvailability = timeBlock.content.availability || [];
      console.log('Current availability:', currentAvailability);

      // Remove existing submission from this participant
      const otherParticipants = currentAvailability.filter(
        a => a.participantId !== participantId
      );
      console.log('Other participants:', otherParticipants);

      // Add new submission
      const updatedAvailability = [
        ...otherParticipants,
        {
          participantId,
          participantName: name.trim(),
          timeSlots: availableSlots,
          submittedAt: Timestamp.now()
        }
      ];

      console.log('Updated availability array:', updatedAvailability);

      // Update the block
      const { updateBlock } = await import('../services/events');
      await updateBlock(eventId, timeBlock.id, {
        content: {
          ...timeBlock.content,
          availability: updatedAvailability
        }
      });

      console.log('✅ Block updated successfully');

      // Store participant ID in localStorage for voting
      localStorage.setItem(`participant_${eventId}`, participantId);

      navigate(`/event/${eventId}`);
    } catch (err) {
      console.error('Error joining event:', err);
      setError(err instanceof Error ? err.message : 'Failed to join event');
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

  // Get time/date data from TimeBlock instead of event
  const eventDates = timeBlock?.content.selectedDates || [];
  const eventStartTime = timeBlock?.content.startTime || '09:00';
  const eventEndTime = timeBlock?.content.endTime || '17:00';
  const intervalMinutes = timeBlock?.content.intervalMinutes || 30;

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="w-full max-w-4xl mx-auto">

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

            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4 text-xs text-gray-500">
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

              <Link
                to={`/event/${eventId}`}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#75619D] hover:bg-[#75619D]/10 border border-[#75619D]/30 hover:border-[#75619D]/50 rounded-md transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                View Event
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Step 1: Info form */}
        {step === 'info' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden max-w-md mx-auto"
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

              <form onSubmit={handleContinue} className="space-y-4">
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
                  disabled={!name.trim() || submitting}
                  className="w-full bg-[#75619D] text-white py-2 px-4 rounded-md text-sm font-medium
                    hover:bg-[#75619D]/90
                    transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'Continue to Availability'
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Step 2: Availability grid */}
        {step === 'availability' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Mark your availability
                </h2>
                <button
                  onClick={() => setStep('info')}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Back
                </button>
              </div>

              {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {eventDates.length > 0 ? (
                <div className="mb-4">
                  <AvailabilityGrid
                    dates={eventDates}
                    startTime={eventStartTime}
                    endTime={eventEndTime}
                    intervalMinutes={intervalMinutes}
                    initialAvailability={initialAvailability}
                    onAvailabilityChange={setAvailability}
                  />
                </div>
              ) : (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                  <p className="text-sm text-gray-600">
                    The organizer hasn't set up availability tracking for this event yet.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleJoin}
                  disabled={submitting}
                  className="flex-1 bg-[#75619D] text-white py-2 px-4 rounded-md text-sm font-medium
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
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          By joining, you agree to share your availability with the event organizer
        </p>
      </div>
    </div>
  );
}
