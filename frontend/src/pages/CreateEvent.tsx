import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createEvent } from '../services/events';
import { Loader2 } from 'lucide-react';

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const createBlankEvent = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        // Create a blank event with placeholder name
        const eventId = await createEvent(
          user.id,
          user.name || user.email || 'Anonymous',
          'Untitled Event',
          { isPublic: true }
        );

        // Immediately redirect to the event page
        navigate(`/event/${eventId}`);
      } catch (error) {
        console.error('Error creating event:', error);
        alert('Failed to create event. Please try again.');
        navigate('/dashboard');
      }
    };

    createBlankEvent();
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[#75619D] animate-spin mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-900">Creating your event...</p>
      </div>
    </div>
  );
};

export default CreateEvent;
