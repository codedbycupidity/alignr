import { useState, useEffect, useRef } from 'react';
import { updateEvent, getEvent } from '../services/events';
import type { EventData } from '../services/events';

export function useEventName(
  eventId: string | undefined,
  event: EventData | null,
  onEventUpdate: (event: EventData) => void
) {
  const [editingName, setEditingName] = useState(false);
  const [eventName, setEventName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize event name
  useEffect(() => {
    if (event) {
      setEventName(event.name);
    }
  }, [event]);

  // Auto-focus name input when editing
  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingName]);

  const handleSaveEventName = async () => {
    if (!eventId || !eventName.trim() || eventName === event?.name) {
      setEditingName(false);
      return;
    }

    setSavingName(true);
    try {
      await updateEvent(eventId, { name: eventName.trim() });
      const updatedEvent = await getEvent(eventId);
      if (updatedEvent) {
        onEventUpdate(updatedEvent);
      }
      setEditingName(false);
    } catch (error) {
      console.error('Error saving event name:', error);
    } finally {
      setSavingName(false);
    }
  };

  const handleCancelEditName = () => {
    setEventName(event?.name || '');
    setEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEventName();
    } else if (e.key === 'Escape') {
      handleCancelEditName();
    }
  };

  return {
    editingName,
    setEditingName,
    eventName,
    setEventName,
    savingName,
    nameInputRef,
    handleSaveEventName,
    handleCancelEditName,
    handleKeyDown
  };
}
