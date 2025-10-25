import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createEvent } from '../services/events';
import { Sparkles, ArrowRight, Loader2, Calendar, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [detectingType, setDetectingType] = useState(false);
  const [detectedType, setDetectedType] = useState('');

  const functions = getFunctions(getApp());

  const handleDetectType = async () => {
    if (!eventName.trim()) return;

    setDetectingType(true);
    try {
      const detectEventType = httpsCallable(functions, 'detectEventType');
      const result = await detectEventType({ eventName });
      const data = result.data as { success: boolean; data?: string };

      if (data.success && data.data) {
        setDetectedType(data.data);
      }
    } catch (error) {
      console.error('Error detecting event type:', error);
    } finally {
      setDetectingType(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    if (!eventName.trim()) return;

    setLoading(true);
    try {
      // Create event in Firestore
      const options: {
        description?: string;
        eventType?: string;
        isPublic?: boolean;
      } = {
        isPublic: true
      };

      if (description.trim()) {
        options.description = description.trim();
      }

      if (detectedType) {
        options.eventType = detectedType;
      }

      const eventId = await createEvent(
        user.id,
        user.email || 'Anonymous',
        eventName.trim(),
        options
      );

      // Navigate to the event page
      navigate(`/event/${eventId}`);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-200 sticky top-0 z-50 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#75619D] rounded-md flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <span className="text-lg font-semibold text-[#75619D]">Alignr</span>
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-900">Create Event</h1>
          <p className="text-sm text-gray-500 mt-1">
            Start planning with AI-powered suggestions
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          onSubmit={handleCreate}
          className="bg-white border border-gray-200 rounded-lg p-6 space-y-6"
        >
          {/* Event Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Event Name
            </label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              onBlur={handleDetectType}
              placeholder="Summer BBQ Party, Team Building Workshop..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent
                transition-colors"
              required
            />
            {detectingType && (
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Analyzing with AI...
              </p>
            )}
            {detectedType && !detectingType && (
              <p className="text-xs text-gray-600 mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#75619D]" />
                Detected as: <span className="font-medium">{detectedType.replace('_', ' ')}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional details..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent
                transition-colors resize-none"
            />
          </div>

          {/* AI Info */}
          <div className="bg-[#BEAEDB]/10 border border-[#BEAEDB]/30 rounded-md p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#75619D] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">AI-Powered Planning</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Gemini AI will analyze your event type and suggest relevant planning blocks like time polls,
                  location suggestions, and task lists.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={loading || !eventName.trim()}
              className="flex-1 px-4 py-2 bg-[#75619D] text-white rounded-md text-sm font-medium hover:bg-[#75619D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: loading ? 1 : 1.01 }}
            >
              <motion.div
                className="flex items-center justify-center gap-2"
                animate={loading ? {
                  opacity: [1, 0.7, 1]
                } : {}}
                transition={{
                  duration: 1.5,
                  repeat: loading ? Infinity : 0,
                  ease: "easeInOut"
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Event
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </>
                )}
              </motion.div>
            </motion.button>
          </div>
        </motion.form>

        {/* Help Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-6 text-center text-xs text-gray-500"
        >
          Share the event link with participants — no login required for them to join!
        </motion.p>
      </div>
    </div>
  );
};

export default CreateEvent;
