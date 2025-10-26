import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEvent, getBlocks, addBlock, updateEvent, updateBlock, deleteBlock, getParticipants, finalizeEvent, removeParticipant, addParticipant } from '../services/events';
import { suggestBlocks, type BlockSuggestion } from '../services/gemini';
import type { EventData } from '../services/events';
import type { Block, TimeBlock, TimeBlockContent, BlockLayout } from '../types/block';
import EventCanvas from '../components/EventCanvas';
import AddTimeBlockModal from '../components/AddTimeBlockModal';
import TaskSuggestionsModal from '../components/TaskSuggestionsModal';
import BlockSuggestionsSidebar from '../components/BlockSuggestionsSidebar';
import EventNavbar from '../components/EventNavbar';
import EditableEventHeader from '../components/EditableEventHeader';
import EventSummary from '../components/EventSummary';
import { shouldFinalizeEvent } from '../utils/eventFinalization';

export default function PlanView() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const [event, setEvent] = useState<EventData | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [suggestions, setSuggestions] = useState<BlockSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showTimeBlockModal, setShowTimeBlockModal] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [eventName, setEventName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const [draggingSuggestion, setDraggingSuggestion] = useState<BlockSuggestion | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [participants, setParticipants] = useState<Array<{ id: string; name: string }>>([]);
  const [showTaskSuggestionsModal, setShowTaskSuggestionsModal] = useState(false);
  const [addingTaskBlock, setAddingTaskBlock] = useState(false);

  // Get participant ID from localStorage if user is not logged in
  useEffect(() => {
    if (!id || user?.id) return;
    const storedParticipantId = localStorage.getItem(`participant_${id}`);
    if (storedParticipantId) {
      setParticipantId(storedParticipantId);
    }
  }, [id, user?.id]);

  useEffect(() => {
    if (!id) return;

    const loadEventData = async () => {
      try {
        console.log('Loading event:', id);

        // Load event, blocks, and participants in parallel
        const [eventData, blocksData, participantsData] = await Promise.all([
          getEvent(id),
          getBlocks(id),
          getParticipants(id)
        ]);

        if (eventData) {
          setEvent(eventData);
          setEventName(eventData.name);
          console.log('Event organizer:', eventData.organizerId);
          console.log('Current user:', user?.id);

          // If organizer and untitled event, open name editor
          if (user?.id === eventData.organizerId && eventData.name === 'Untitled Event') {
            setEditingName(true);
          }

          // If organizer and no blocks but has a real name, suggest some
          if (user?.id === eventData.organizerId && blocksData.length === 0 && eventData.name !== 'Untitled Event') {
            loadSuggestions(eventData);
          }
        }

        setBlocks(blocksData);
        // Count participants excluding organizer
        const nonOrganizerCount = participantsData.filter(p => p.id !== eventData?.organizerId).length;
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
  }, [id, user]);

  // Auto-finalize event if date has passed
  useEffect(() => {
    if (!id || !event || !blocks.length) return;

    // Only auto-finalize if event is not already finalized
    if (event.status === 'finalized') return;

    // Check if event should be finalized based on date
    if (shouldFinalizeEvent(blocks)) {
      console.log('Event date has passed, auto-finalizing...');

      finalizeEvent(id)
        .then(() => {
          console.log('Event auto-finalized successfully');
          // Reload event data to update status
          getEvent(id).then(updatedEvent => {
            if (updatedEvent) {
              setEvent(updatedEvent);
            }
          });
        })
        .catch(error => {
          console.error('Error auto-finalizing event:', error);
        });
    }
  }, [id, event, blocks]);

  const loadSuggestions = async (eventData: EventData) => {
    setLoadingSuggestions(true);
    try {
      const blockSuggestions = await suggestBlocks(eventData);
      setSuggestions(blockSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSaveEventName = async () => {
    if (!id || !eventName.trim() || eventName === event?.name) {
      setEditingName(false);
      return;
    }

    setSavingName(true);
    try {
      await updateEvent(id, { name: eventName.trim() });
      const updatedEvent = await getEvent(id);
      if (updatedEvent) {
        setEvent(updatedEvent);

        // Trigger AI suggestions after naming
        if (user?.id === updatedEvent.organizerId && blocks.length === 0) {
          loadSuggestions(updatedEvent);
        }
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

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingName]);

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/join/${id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddTimeBlock = async (config: TimeBlockContent, dropPosition?: { x: number; y: number }) => {
    if (!id || !user) return;

    // Calculate dynamic size based on content
    const numDates = config.selectedDates?.length || 1;
    const numDays = config.selectedDays?.length || 1;
    const dateCount = config.dateType === 'specific' ? numDates : numDays;

    // Calculate time slots
    const [startHour, startMin] = (config.startTime || '09:00').split(':').map(Number);
    const [endHour, endMin] = (config.endTime || '17:00').split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const numTimeSlots = Math.ceil((endMinutes - startMinutes) / (config.intervalMinutes || 30));

    // Calculate grid dimensions
    // Width: 80px (time col) + 40px per date + 24px padding = containerWidth
    // Then convert to grid units (each unit ~83px for 1000px / 12 cols)
    const containerWidth = 80 + (dateCount * 40) + 24;
    const gridWidth = Math.min(12, Math.max(4, Math.ceil(containerWidth / 83)));

    // Height: header (40px) + rows (24px per slot) + padding
    // Each grid unit is 100px
    const containerHeight = 40 + 24 + (numTimeSlots * 24) + 16;
    const gridHeight = Math.max(2, Math.ceil(containerHeight / 100));

    let layout: BlockLayout;

    if (dropPosition) {
      // Calculate grid position from pixel coordinates
      const canvasElement = document.querySelector('.react-grid-layout');
      if (canvasElement) {
        const rect = canvasElement.getBoundingClientRect();
        const relativeX = dropPosition.x - rect.left;
        const relativeY = dropPosition.y - rect.top;

        // Convert to grid coordinates
        const gridX = Math.floor((relativeX / rect.width) * 12);
        const gridY = Math.floor(relativeY / 100); // 100px row height

        layout = {
          x: Math.max(0, Math.min(12 - gridWidth, gridX)),
          y: Math.max(0, gridY),
          w: gridWidth,
          h: gridHeight
        };
      } else {
        // Fallback
        layout = { x: 0, y: 0, w: gridWidth, h: gridHeight };
      }
    } else {
      // Calculate next available position
      const nextY = blocks.length > 0
        ? Math.max(...blocks.map(b => b.layout.y + b.layout.h))
        : 0;

      layout = {
        x: 0,
        y: nextY,
        w: gridWidth,
        h: gridHeight
      };
    }

    const newBlock: Omit<Block, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'time',
      title: 'Group Avaliability',
      content: config,
      order: blocks.length,
      author: user.id,
      layout
    };

    await addBlock(id, newBlock);

    // Reload blocks
    const updatedBlocks = await getBlocks(id);
    setBlocks(updatedBlocks);
    setSuggestions([]); // Clear suggestions after adding a block
    setDraggingSuggestion(null);
    setIsDragging(false);
  };

  const handleLayoutChange = async (blockId: string, layout: BlockLayout) => {
    if (!id) return;

    try {
      await updateBlock(id, blockId, { layout });
      console.log('Block layout updated:', blockId, layout);
    } catch (error) {
      console.error('Error updating block layout:', error);
    }
  };

  const handleSuggestionClick = async (suggestion: BlockSuggestion) => {
    console.log('Clicked suggestion:', suggestion);
    if (!id) return;

    if (suggestion.blockType === 'time') {
      console.log('Opening time block modal');
      setShowTimeBlockModal(true);
    } else if (suggestion.blockType === 'task') {
      console.log('Opening task suggestions modal');
      setShowTaskSuggestionsModal(true);
    } else if (suggestion.blockType === 'location') {
      const newBlock = {
        type: 'location' as const,
        content: {
          options: []
        },
        layout: {
          x: 0,
          y: blocks.length * 2,
          w: 6,
          h: 3
        },
        order: blocks.length,
        author: user?.id || participantId || 'anonymous'
      };
      await addBlock(id, newBlock);
      const updatedBlocks = await getBlocks(id);
      setBlocks(updatedBlocks);
      setSuggestions([]);
    } else if (suggestion.blockType === 'budget') {
      const newBlock = {
        type: 'budget' as const,
        content: {
          responses: []
        },
        layout: {
          x: 0,
          y: blocks.length * 2,
          w: 4,
          h: 3
        },
        order: blocks.length,
        author: user?.id || participantId || 'anonymous'
      };
      await addBlock(id, newBlock);
      const updatedBlocks = await getBlocks(id);
      setBlocks(updatedBlocks);
      setSuggestions([]);
    } else {
      alert(`Block type "${suggestion.blockType}" not yet implemented`);
    }
  };

  const handleDragStart = (e: React.DragEvent, suggestion: BlockSuggestion) => {
    e.dataTransfer.effectAllowed = 'copy';
    setDraggingSuggestion(suggestion);
    setIsDragging(true);

    // Open modal immediately when drag starts
    if (suggestion.blockType === 'time') {
      setShowTimeBlockModal(true);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    if (e.clientX !== 0 && e.clientY !== 0) {
      setDragPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Don't clear draggingSuggestion yet - wait for drop or cancel
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();

    if (draggingSuggestion && showTimeBlockModal) {
      // Store drop position for when modal confirms
      setDragPosition({ x: e.clientX, y: e.clientY });
      // Modal is already open from drag start, user will configure and confirm
    }
  };

  // Find TimeBlock with availability mode (for participant count)
  const timeBlock = blocks.find(
    (block): block is TimeBlock => {
      if (block.type === 'time') {
        const tb = block as TimeBlock;
        return tb.content.mode === 'availability';
      }
      return false;
    }
  ) as TimeBlock | undefined;

  // Find TimeBlock with fixed mode (for header display)
  const fixedTimeBlock = blocks.find(
    (block): block is TimeBlock => {
      if (block.type === 'time') {
        const tb = block as TimeBlock;
        return tb.content.mode === 'fixed';
      }
      return false;
    }
  ) as TimeBlock | undefined;

  // Filter out fixed time blocks from canvas display
  const canvasBlocks = blocks.filter(block => {
    if (block.type === 'time') {
      const tb = block as TimeBlock;
      return tb.content.mode !== 'fixed';
    }
    return true;
  });

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
      <EventNavbar
        eventId={id!}
        isOrganizer={user?.id === event?.organizerId}
        isLoggedIn={!!user}
        copied={copied}
        onCopyLink={handleCopyLink}
        onLogout={logout}
      />

      {/*Main content */}
      <main className="flex max-w-7xl mx-auto">
        {/* Left Sidebar - Block Suggestions */}
        {user?.id === event?.organizerId && (
          <BlockSuggestionsSidebar
            loadingSuggestions={loadingSuggestions}
            suggestions={suggestions}
            existingBlocks={blocks}
            onSuggestionClick={handleSuggestionClick}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onAddBlock={async (blockType) => {
              if (blockType === 'time') {
                setShowTimeBlockModal(true);
              } else if (blockType === 'location') {
                // Add empty location block
                const newBlock = {
                  type: 'location' as const,
                  content: {
                    options: []
                  },
                  layout: {
                    x: 0,
                    y: blocks.length * 2,
                    w: 6,
                    h: 3
                  },
                  order: blocks.length,
                  author: user?.id || participantId || 'anonymous'
                };
                await addBlock(id!, newBlock);
                const updatedBlocks = await getBlocks(id!);
                setBlocks(updatedBlocks);
              } else if (blockType === 'budget') {
                // Add empty budget block
                const newBlock = {
                  type: 'budget' as const,
                  content: {
                    responses: []
                  },
                  layout: {
                    x: 0,
                    y: blocks.length * 2,
                    w: 4,
                    h: 3
                  },
                  order: blocks.length,
                  author: user?.id || participantId || 'anonymous'
                };
                await addBlock(id!, newBlock);
                const updatedBlocks = await getBlocks(id!);
                setBlocks(updatedBlocks);
              } else if (blockType === 'task') {
                // Show task suggestions modal
                setShowTaskSuggestionsModal(true);
              } else if (blockType === 'note') {
                // Add empty note block
                const newBlock = {
                  type: 'note' as const,
                  content: {
                    text: '',
                    comments: [],
                    likes: []
                  },
                  layout: {
                    x: 0,
                    y: blocks.length * 2,
                    w: 5,
                    h: 3
                  },
                  order: blocks.length,
                  author: user?.id || participantId || 'anonymous'
                };
                await addBlock(id!, newBlock);
                const updatedBlocks = await getBlocks(id!);
                setBlocks(updatedBlocks);
              } else if (blockType === 'rsvp') {
                // Add RSVP block
                const newBlock = {
                  type: 'rsvp' as const,
                  content: {},
                  layout: {
                    x: 0,
                    y: blocks.length * 2,
                    w: 4,
                    h: 4
                  },
                  order: blocks.length,
                  author: user?.id || participantId || 'anonymous'
                };
                await addBlock(id!, newBlock);
                const updatedBlocks = await getBlocks(id!);
                setBlocks(updatedBlocks);
              } else {
                // TODO: Handle other block types
                console.log('Add block type:', blockType);
              }
            }}
          />
        )}

        {/* Main Canvas */}
        <div className="flex-1 px-6 py-8">
          {/* Event Header with Editable Name */}
          <EditableEventHeader
            eventName={eventName}
            eventDescription={event?.description}
            isOrganizer={user?.id === event?.organizerId}
            editingName={editingName}
            savingName={savingName}
            timeBlock={timeBlock || null}
            fixedTimeBlock={fixedTimeBlock || null}
            participantCount={participantCount}
            nameInputRef={nameInputRef}
            onNameChange={setEventName}
            onSaveName={handleSaveEventName}
            onCancelEdit={handleCancelEditName}
            onStartEdit={() => setEditingName(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEventName();
              if (e.key === 'Escape') handleCancelEditName();
            }}
            onDeleteFixedTimeBlock={async () => {
              if (!id || !fixedTimeBlock) return;
              await deleteBlock(id, fixedTimeBlock.id);
              const updatedBlocks = await getBlocks(id);
              setBlocks(updatedBlocks);
            }}
            onDescriptionSave={async (description: string) => {
              if (!id) return;
              await updateEvent(id, { description });
              const updatedEvent = await getEvent(id);
              if (updatedEvent) {
                setEvent(updatedEvent);
              }
            }}
          />

          {/* Event Summary (AI-generated insight) */}
          {id && event && (
            <EventSummary
              eventId={id}
              isOrganizer={user?.id === event.organizerId}
              eventStatus={event.status || 'active'}
              blockCount={blocks.length}
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
              isOrganizer={user?.id === event?.organizerId}
              currentUserId={user?.id || participantId || undefined}
              eventId={id}
              organizerId={event?.organizerId}
              participants={participants}
              onLayoutChange={handleLayoutChange}
              onBlockUpdate={async (blockId, updates) => {
                if (!id) return;
                const blockToUpdate = blocks.find(b => b.id === blockId);
                if (!blockToUpdate) return;

                const updatedBlock = { ...blockToUpdate, ...updates };
                await updateBlock(id, blockId, updatedBlock);

                // Reload blocks
                const updatedBlocks = await getBlocks(id);
                setBlocks(updatedBlocks);
              }}
              onBlockDelete={async (blockId) => {
                if (!id) return;
                await deleteBlock(id, blockId);

                // Reload blocks
                const updatedBlocks = await getBlocks(id);
                setBlocks(updatedBlocks);
              }}
              onRemoveParticipant={async (participantId) => {
                if (!id) return;

                try {
                  await removeParticipant(id, participantId);

                  // Reload participants
                  const updatedParticipants = await getParticipants(id);
                  // Count participants excluding organizer
                  const nonOrganizerCount = updatedParticipants.filter(p => p.id !== event?.organizerId).length;
                  setParticipantCount(nonOrganizerCount);
                  setParticipants(updatedParticipants.map(p => ({ id: p.id, name: p.name })));

                  // Reload blocks to update participant lists in blocks
                  const updatedBlocks = await getBlocks(id);
                  setBlocks(updatedBlocks);
                } catch (error) {
                  console.error('Error removing participant:', error);
                  alert('Failed to remove participant. Please try again.');
                }
              }}
              onAddParticipant={async (name: string) => {
                if (!id) return;

                try {
                  // Add participant to event
                  await addParticipant(id, name);

                  // Reload participants
                  const updatedParticipants = await getParticipants(id);
                  // Count participants excluding organizer
                  const nonOrganizerCount = updatedParticipants.filter(p => p.id !== event?.organizerId).length;
                  setParticipantCount(nonOrganizerCount);
                  setParticipants(updatedParticipants.map(p => ({ id: p.id, name: p.name })));

                  // Reload blocks to update participant lists in blocks
                  const updatedBlocks = await getBlocks(id);
                  setBlocks(updatedBlocks);
                } catch (error) {
                  console.error('Error adding participant:', error);
                  alert('Failed to add participant. Please try again.');
                }
              }}
              onSelectTimeSlot={async (date, startTime, endTime) => {
                if (!id) return;

                // Format the date nicely
                const dateObj = new Date(date + 'T00:00:00');
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });

                // Format times to 12-hour
                const formatTime = (time24: string) => {
                  const [hour, min] = time24.split(':').map(Number);
                  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                  const ampm = hour < 12 ? 'AM' : 'PM';
                  return `${hour12}:${min.toString().padStart(2, '0')} ${ampm}`;
                };

                const description = `${formattedDate} • ${formatTime(startTime)} - ${formatTime(endTime)}`;

                await updateEvent(id, { description });
                const updatedEvent = await getEvent(id);
                if (updatedEvent) {
                  setEvent(updatedEvent);
                }
              }}
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
            setDraggingSuggestion(null);
            setIsDragging(false);
          }}
          onConfirm={async (config) => {
            const dropPos = isDragging && draggingSuggestion ? dragPosition : undefined;
            await handleAddTimeBlock(config, dropPos);
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
          onAccept={async (tasks) => {
            if (!id || addingTaskBlock) return;

            setAddingTaskBlock(true);
            try {
              const newBlock = {
                type: 'task' as const,
                content: {
                  tasks
                },
                layout: {
                  x: 0,
                  y: blocks.length * 2,
                  w: 5,
                  h: 4
                },
                order: blocks.length,
                author: user?.id || participantId || 'anonymous'
              };

              await addBlock(id, newBlock);
              const updatedBlocks = await getBlocks(id);
              setBlocks(updatedBlocks);
              setShowTaskSuggestionsModal(false);
            } finally {
              setAddingTaskBlock(false);
            }
          }}
          onSkip={async () => {
            if (!id || addingTaskBlock) return;

            setAddingTaskBlock(true);
            try {
              const newBlock = {
                type: 'task' as const,
                content: {
                  tasks: []
                },
                layout: {
                  x: 0,
                  y: blocks.length * 2,
                  w: 5,
                  h: 4
                },
                order: blocks.length,
                author: user?.id || participantId || 'anonymous'
              };

              await addBlock(id, newBlock);
              const updatedBlocks = await getBlocks(id);
              setBlocks(updatedBlocks);
              setShowTaskSuggestionsModal(false);
            } finally {
              setAddingTaskBlock(false);
            }
          }}
        />
      )}
    </div>
  );
}
