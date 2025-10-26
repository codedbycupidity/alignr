import { useState, useEffect } from 'react';

export function useParticipantManagement(
  eventId: string | undefined,
  userId: string | undefined
) {
  const [participantId, setParticipantId] = useState<string | null>(null);

  // Get participant ID from localStorage if user is not logged in
  useEffect(() => {
    if (!eventId || userId) return;
    const storedParticipantId = localStorage.getItem(`participant_${eventId}`);
    if (storedParticipantId) {
      setParticipantId(storedParticipantId);
    }
  }, [eventId, userId]);

  return {
    participantId
  };
}
