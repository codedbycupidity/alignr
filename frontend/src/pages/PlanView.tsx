import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateEvent, getEvent, deleteBlock, addBlock } from '../services/events';
import type { TimeBlockContent, TimeBlock } from '../types/block';
import EventCanvas from '../components/EventCanvas';
import AddTimeBlockModal from '../components/AddTimeBlockModal';
import TaskSuggestionsModal from '../components/TaskSuggestionsModal';
import BlockSuggestionsSidebar from '../components/BlockSuggestionsSidebar';
import EventNavbar from '../components/EventNavbar';
import EditableEventHeader from '../components/EditableEventHeader';
import EventSummary from '../components/EventSummary';

// Custom hooks
import { useEventData } from '../hooks/useEventData';
import { useEventName } from '../hooks/useEventName';
import { useBlockSuggestions } from '../hooks/useBlockSuggestions';
import { useParticipantManagement } from '../hooks/useParticipantManagement';
import { useBlockHandlers } from '../hooks/useBlockHandlers';

export default function PlanView() {
  const { id } = useParams();
  const { user, logout } = useAuth();

  // Modals state
  const [showTimeBlockModal, setShowTimeBlockModal] = useState(false);
  const [showTaskSuggestionsModal, setShowTaskSuggestionsModal] = useState(false);
  const [addingTaskBlock, setAddingTaskBlock] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load event data
  const {
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
  } = useEventData(id, user?.id);

  // Participant management
  const { participantId } = useParticipantManagement(id, user?.id);

  // Event name editing
  const {
    editingName,
    setEditingName,
    eventName,
    setEventName,
    savingName,
    nameInputRef,
    handleSaveEventName: saveEventName,
    handleCancelEditName,
    handleKeyDown
  } = useEventName(id, event, (updatedEvent) => {
    setEvent(updatedEvent);
    // Trigger AI suggestions after naming
    if (user?.id === updatedEvent.organizerId && blocks.length === 0) {
      loadSuggestions(updatedEvent);
    }
  });

  // Block suggestions
  const {
    suggestions,
    loadingSuggestions,
    draggingSuggestion,
    dragPosition,
    isDragging,
    loadSuggestions,
    handleDragStart,
    handleDrag,
    handleDragEnd
  } = useBlockSuggestions();

  // Block handlers
  const {
    handleAddTimeBlock,
    handleLayoutChange,
    handleBlockUpdate,
    handleBlockDelete,
    handleRemoveParticipant,
    handleAddParticipant,
    handleAddBlock
  } = useBlockHandlers({
    eventId: id,
    userId: user?.id,
    participantId,
    blocks,
    onBlocksUpdate: setBlocks,
    onParticipantsReload: reloadParticipants
  });

  // Load suggestions on initial event load
  useEffect(() => {
    if (!event || !user) return;

    // If organizer and untitled event, open name editor
    if (user.id === event.organizerId && event.name === 'Untitled Event') {
      setEditingName(true);
    }

    // If organizer and no blocks but has a real name, suggest some
    if (user.id === event.organizerId && blocks.length === 0 && event.name !== 'Untitled Event') {
      loadSuggestions(event);
    }
  }, [event, user, blocks.length]);

  // Derived state
  const isOrganizer = useMemo(() => user?.id === event?.organizerId, [user, event]);
  const currentUserId = useMemo(() => user?.id || participantId || undefined, [user, participantId]);

  const timeBlock = useMemo(() => {
    const block = blocks.find(b => {
      if (b.type !== 'time') return false;
      const content = b.content as TimeBlockContent;
      return !content.fixedDate;
    });
    return block ? (block as TimeBlock) : null;
  }, [blocks]);

  const fixedTimeBlock = useMemo(() => {
    const block = blocks.find(b => {
      if (b.type !== 'time') return false;
      const content = b.content as TimeBlockContent;
      return content.fixedDate;
    });
    return block ? (block as TimeBlock) : null;
  }, [blocks]);

  const canvasBlocks = useMemo(
    () => blocks.filter(b => {
      if (b.type !== 'time') return true;
      const content = b.content as TimeBlockContent;
      return !content.fixedDate;
    }),
    [blocks]
  );

  // Handlers
  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/join/${id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSuggestionClick = async (suggestion: any) => {
    // For time blocks, open the modal for configuration
    if (suggestion.blockType === 'time') {
      setShowTimeBlockModal(true);
    } else {
      // For all other block types, create the block directly
      await handleAddBlockType(suggestion.blockType);
    }
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggingSuggestion?.blockType === 'time') {
      setShowTimeBlockModal(true);
    }
  };

  const handleSelectTimeSlot = async (date: string, startTime: string, endTime: string) => {
    if (!id || !timeBlock) return;

    // Format times to 12-hour
    const formatTime = (time24: string) => {
      const [hour, min] = time24.split(':').map(Number);
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? 'AM' : 'PM';
      return `${hour12}:${min.toString().padStart(2, '0')} ${ampm}`;
    };

    // Check if date is a day name (like "Monday") or a date string (like "2025-01-15")
    const isDayName = /^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)$/.test(date);

    let formattedDate: string;
    if (isDayName) {
      // For day names, just use the day name
      formattedDate = date;
    } else {
      // For specific dates, format nicely
      const dateObj = new Date(date + 'T00:00:00');
      formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    const description = `${formattedDate} • ${formatTime(startTime)} - ${formatTime(endTime)}`;

    // Update the event description
    await updateEvent(id, { description });

    // Convert the TimeBlock to fixed mode
    await handleBlockUpdate(timeBlock.id, {
      content: {
        ...timeBlock.content,
        mode: 'fixed',
        fixedDate: date,
        fixedStartTime: startTime,
        fixedEndTime: endTime,
        fixedTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    });

    await reloadEvent();
  };

  const handleAddBlockType = async (blockType: string) => {
    if (blockType === 'time') {
      setShowTimeBlockModal(true);
    } else if (blockType === 'task') {
      setShowTaskSuggestionsModal(true);
    } else {
      await handleAddBlock(blockType);
    }
  };

  const handleTaskModalAccept = async (tasks: any[]) => {
    if (!id || addingTaskBlock) return;

    setAddingTaskBlock(true);
    try {
      const newBlock = {
        type: 'task' as const,
        content: { tasks },
        layout: { x: 0, y: blocks.length * 2, w: 5, h: 4 },
        order: blocks.length,
        author: user?.id || participantId || 'anonymous'
      };

      await addBlock(id, newBlock);
      await reloadBlocks();
      setShowTaskSuggestionsModal(false);
    } finally {
      setAddingTaskBlock(false);
    }
  };

  const handleTaskModalSkip = async () => {
    if (!id || addingTaskBlock) return;

    setAddingTaskBlock(true);
    try {
      const newBlock = {
        type: 'task' as const,
        content: { tasks: [] },
        layout: { x: 0, y: blocks.length * 2, w: 5, h: 4 },
        order: blocks.length,
        author: user?.id || participantId || 'anonymous'
      };

      await addBlock(id, newBlock);
      await reloadBlocks();
      setShowTaskSuggestionsModal(false);
    } finally {
      setAddingTaskBlock(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFB] via-white to-[#F5F3FF] overflow-x-hidden">
      {/* Top bar */}
      <EventNavbar
        eventId={id!}
        isOrganizer={isOrganizer}
        isLoggedIn={!!user}
        copied={copied}
        onCopyLink={handleCopyLink}
        onLogout={logout}
      />

      {/* Main content */}
      <main className="flex flex-col lg:flex-row max-w-7xl mx-auto overflow-x-hidden">
        {/* Left Sidebar - Block Suggestions (Organizer only) */}
        {isOrganizer && (
          <BlockSuggestionsSidebar
            loadingSuggestions={loadingSuggestions}
            suggestions={suggestions}
            existingBlocks={blocks}
            onSuggestionClick={handleSuggestionClick}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onAddBlock={handleAddBlockType}
          />
        )}

        {/* Main Canvas */}
        <div className="flex-1 px-4 sm:px-6 py-4 sm:py-8">
          {/* Event Header */}
          <EditableEventHeader
            eventName={eventName}
            eventDescription={event?.description}
            isOrganizer={isOrganizer}
            editingName={editingName}
            savingName={savingName}
            timeBlock={timeBlock}
            fixedTimeBlock={fixedTimeBlock}
            participantCount={participantCount}
            nameInputRef={nameInputRef}
            onNameChange={setEventName}
            onSaveName={saveEventName}
            onCancelEdit={handleCancelEditName}
            onStartEdit={() => setEditingName(true)}
            onKeyDown={handleKeyDown}
            onDeleteFixedTimeBlock={async () => {
              if (!id || !fixedTimeBlock) return;
              await deleteBlock(id, fixedTimeBlock.id);
              await reloadBlocks();
            }}
            onDescriptionSave={async (description: string) => {
              if (!id) return;
              await updateEvent(id, { description });
              await reloadEvent();
            }}
          />

          {/* Event Summary (AI-generated insight) */}
          {id && event && (
            <EventSummary
              eventId={id}
              isOrganizer={isOrganizer}
              eventStatus={event.status || 'active'}
              blockCount={blocks.length}
              summaryHidden={event.summaryHidden}
            />
          )}

          {/* Event Canvas with Blocks */}
          <div
            onDragOver={handleCanvasDragOver}
            onDrop={handleCanvasDrop}
            className={isDragging ? 'ring-2 ring-[#75619D] ring-opacity-50 rounded-lg transition-all' : ''}
          >
            <EventCanvas
              blocks={canvasBlocks}
              isOrganizer={isOrganizer}
              currentUserId={currentUserId}
              eventId={id}
              organizerId={event?.organizerId}
              organizerName={event?.organizerName}
              participants={participants}
              onLayoutChange={handleLayoutChange}
              onBlockUpdate={handleBlockUpdate}
              onBlockDelete={handleBlockDelete}
              onRemoveParticipant={handleRemoveParticipant}
              onAddParticipant={handleAddParticipant}
              onSelectTimeSlot={handleSelectTimeSlot}
            />
          </div>
        </div>
      </main>

      {/* Time Block Modal */}
      {event && (
        <AddTimeBlockModal
          isOpen={showTimeBlockModal}
          onClose={() => {
            setShowTimeBlockModal(false);
            handleDragEnd();
          }}
          onConfirm={async (config: TimeBlockContent) => {
            const dropPos = isDragging && draggingSuggestion ? dragPosition : undefined;
            await handleAddTimeBlock(config, dropPos);
            setShowTimeBlockModal(false);
          }}
          eventName={event.name}
          isDragging={isDragging && draggingSuggestion !== null}
        />
      )}

      {/* Task Suggestions Modal */}
      {event && (
        <TaskSuggestionsModal
          isOpen={showTaskSuggestionsModal}
          eventName={event.name}
          eventDescription={event.description}
          onAccept={handleTaskModalAccept}
          onSkip={handleTaskModalSkip}
        />
      )}
    </div>
  );
}
