import { useState, useEffect } from 'react';
import { getEvent, getBlocks, getParticipants, finalizeEvent } from '../services/events';
import type { EventData } from '../services/events';
import type { Block } from '../types/block';
import { shouldFinalizeEvent } from '../utils/eventFinalization';

export function useEventData(eventId: string | undefined, userId: string | undefined) {
  const [event, setEvent] = useState<EventData | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [participants, setParticipants] = useState<Array<{ id: string; name: string }>>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load event data
  useEffect(() => {
    if (!eventId) return;

    const loadEventData = async () => {
      try {
        console.log('Loading event:', eventId);

        // Load event, blocks, and participants in parallel
        const [eventData, blocksData, participantsData] = await Promise.all([
          getEvent(eventId),
          getBlocks(eventId),
          getParticipants(eventId)
        ]);

        if (eventData) {
          setEvent(eventData);
          console.log('Event organizer:', eventData.organizerId);
          console.log('Current user:', userId);
        }

        setBlocks(blocksData);

        // Count participants excluding organizer
        const nonOrganizerCount = participantsData.filter(
          p => p.id !== eventData?.organizerId
        ).length;
        setParticipantCount(nonOrganizerCount);
        setParticipants(participantsData.map(p => ({ id: p.id, name: p.name })));

        console.log('Loaded blocks:', blocksData);
        console.log('Loaded participants:', participantsData.length);
      } catch (error) {
        console.error('Error loading event data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [eventId, userId]);

  // Auto-finalize event if date has passed
  useEffect(() => {
    if (!eventId || !event || !blocks.length) return;

    // Only auto-finalize if event is not already finalized
    if (event.status === 'finalized') return;

    // Check if event should be finalized based on date
    if (shouldFinalizeEvent(blocks)) {
      console.log('Event date has passed, auto-finalizing...');

      finalizeEvent(eventId)
        .then(() => {
          console.log('Event auto-finalized successfully');
          // Reload event data to update status
          getEvent(eventId).then(updatedEvent => {
            if (updatedEvent) {
              setEvent(updatedEvent);
            }
          });
        })
        .catch(error => {
          console.error('Error auto-finalizing event:', error);
        });
    }
  }, [eventId, event, blocks]);

  const reloadBlocks = async () => {
    if (!eventId) return;
    const updatedBlocks = await getBlocks(eventId);
    setBlocks(updatedBlocks);
  };

  const reloadParticipants = async () => {
    if (!eventId) return;
    const updatedParticipants = await getParticipants(eventId);
    const nonOrganizerCount = updatedParticipants.filter(
      p => p.id !== event?.organizerId
    ).length;
    setParticipantCount(nonOrganizerCount);
    setParticipants(updatedParticipants.map(p => ({ id: p.id, name: p.name })));
  };

  const reloadEvent = async () => {
    if (!eventId) return;
    const updatedEvent = await getEvent(eventId);
    if (updatedEvent) {
      setEvent(updatedEvent);
    }
  };

  return {
    event,
    setEvent,
    blocks,
    setBlocks,
    participants,
    participantCount,
    loading,
    reloadBlocks,
    reloadParticipants,
    reloadEvent
  };
}
