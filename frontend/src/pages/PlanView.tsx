import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEvent, getBlocks, addBlock, updateEvent, updateBlock, deleteBlock, getParticipants } from '../services/events';
import { suggestBlocks, type BlockSuggestion } from '../services/gemini';
import type { EventData } from '../services/events';
import type { Block, TimeBlock, TimeBlockContent, BlockLayout } from '../types/block';
import EventCanvas from '../components/EventCanvas';
import AddTimeBlockModal from '../components/AddTimeBlockModal';
import TaskSuggestionsModal from '../components/TaskSuggestionsModal';
import BlockSuggestionsSidebar from '../components/BlockSuggestionsSidebar';
import EventNavbar from '../components/EventNavbar';
import EditableEventHeader from '../components/EditableEventHeader';

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
  const [editingFixedBlockId, setEditingFixedBlockId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [eventName, setEventName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const [draggingSuggestion, setDraggingSuggestion] = useState<BlockSuggestion | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [showTaskSuggestionsModal, setShowTaskSuggestionsModal] = useState(false);
  const [addingTaskBlock, setAddingTaskBlock] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Closed by default to save space
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [deletingBlockId, setDeletingBlockId] = useState<string | null>(null);

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
        setParticipantCount(participantsData.length);
        console.log('Loaded blocks:', blocksData);
        console.log('Loaded participants:', participantsData.length);
      } catch (error) {
        console.error('Error loading event data:', error);
        setError('Failed to load event. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [id, user]);

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
      title: 'Find the Best Time',
      content: config,
      order: blocks.length,
      author: user.id,
      layout
    };

    try {
      await addBlock(id, newBlock);
      const updatedBlocks = await getBlocks(id);
      setBlocks(updatedBlocks);
      setShowTimeBlockModal(false);
      setDraggingSuggestion(null);
      setIsDragging(false);
    } catch (error) {
      console.error('Error adding time block:', error);
    }
  };

  const handleSuggestionClick = async (suggestion: BlockSuggestion) => {
    if (suggestion.blockType === 'time') {
      setShowTimeBlockModal(true);
    }
  };

  const handleDragStart = (e: React.DragEvent, suggestion: BlockSuggestion) => {
    setDraggingSuggestion(suggestion);
    setIsDragging(true);
    setDragPosition({ x: e.clientX, y: e.clientY });
  };

  const handleDrag = (e: React.DragEvent) => {
    setDragPosition({ x: e.clientX, y: e.clientY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCanvasDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingSuggestion) {
      setIsDragging(false);
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const dropPosition = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    // If suggestion is a time block, open modal with drop position
    if (draggingSuggestion.blockType === 'time') {
      setShowTimeBlockModal(true);
      setDragPosition(dropPosition);
      setIsDragging(false);
      return;
    }

    // For other block types, create a new block at the drop position
    try {
      if (!id) return;
      setError(null); // Clear previous errors

      // Get the exact drop coordinates relative to the canvas
      const canvasElement = document.querySelector('.react-grid-layout');
      let gridX = 0;
      let gridY = 0;
      if (canvasElement) {
        const crect = canvasElement.getBoundingClientRect();
        // Convert pixel position to grid units (24 cols, 30px rows)
        gridX = Math.floor((dropPosition.x / crect.width) * 24);
        gridY = Math.floor(dropPosition.y / 30);
      }

      // Determine block size based on type for better visibility
      const getBlockSize = (blockType: string) => {
        switch (blockType) {
          case 'image':
            return { w: 8, h: 8 }; // Square for images
          case 'time':
            return { w: 12, h: 10 }; // Wide for calendar
          case 'location':
            return { w: 8, h: 6 }; // Medium rectangle
          case 'budget':
            return { w: 6, h: 6 }; // Square for budget
          case 'task':
            return { w: 8, h: 8 }; // Square for task list
          case 'note':
            return { w: 8, h: 6 }; // Medium rectangle
          default:
            return { w: 8, h: 6 }; // Default size
        }
      };

      const blockSize = getBlockSize(draggingSuggestion.blockType);
      const baseLayout = {
        x: Math.max(0, Math.min(23, gridX)), // 24 cols (0-23)
        y: Math.max(0, gridY),
        w: blockSize.w,
        h: blockSize.h
      } as any;

      const authorId = user?.id || participantId || 'anonymous';

      if (draggingSuggestion.blockType === 'location') {
        const newBlock = {
          type: 'location' as const,
          title: 'Location',
          content: { options: [] },
          layout: baseLayout,
          order: blocks.length,
          author: authorId
        };
        await addBlock(id, newBlock);
      } else if (draggingSuggestion.blockType === 'budget') {
        const newBlock = {
          type: 'budget' as const,
          title: 'Budget',
          content: { responses: [] },
          layout: baseLayout,
          order: blocks.length,
          author: authorId
        };
        await addBlock(id, newBlock as any);
      } else if (draggingSuggestion.blockType === 'image') {
        const newBlock = {
          type: 'image' as const,
          title: 'Photo Gallery',
          content: { images: [], allowParticipantUploads: true },
          layout: { ...baseLayout, h: 4 },
          order: blocks.length,
          author: authorId
        } as any;
        await addBlock(id, newBlock);
      } else if (draggingSuggestion.blockType === 'note') {
        const newBlock = {
          type: 'note' as const,
          title: 'Notes',
          content: { text: '', comments: [] },
          layout: baseLayout,
          order: blocks.length,
          author: authorId
        };
        await addBlock(id, newBlock);
      } else if (draggingSuggestion.blockType === 'task') {
        // For task suggestions, open the task suggestions modal instead of adding directly
        setShowTaskSuggestionsModal(true);
      } else {
        // Fallback: create a simple note block
        const newBlock = {
          type: 'note' as const,
          title: 'Notes',
          content: { text: '', comments: [] },
          layout: baseLayout,
          order: blocks.length,
          author: authorId
        };
        await addBlock(id, newBlock);
      }

      // reload blocks after adding
      const updatedBlocks = await getBlocks(id);
      setBlocks(updatedBlocks);
      showNotification('Block added successfully!', 'success');
    } catch (err) {
      console.error('Error handling drop:', err);
      showNotification('Failed to add block. Please try again.', 'error');
    } finally {
      setIsDragging(false);
      setDraggingSuggestion(null);
    }
  };

  const handleLayoutChange = async (blockId: string, layout: BlockLayout) => {
    if (!id) return;
    try {
      const blockToUpdate = blocks.find(b => b.id === blockId);
      if (!blockToUpdate) return;

      const updatedBlock = { ...blockToUpdate, layout };
      await updateBlock(id, blockId, updatedBlock);
    } catch (error) {
      console.error('Error updating layout:', error);
    }
  };

  const timeBlock = blocks.find(b => b.type === 'time') as TimeBlock | undefined;
  const fixedTimeBlock = blocks.find(
    b => b.type === 'time' && (b as TimeBlock).content.mode === 'fixed'
  ) as TimeBlock | undefined;

  const canvasBlocks = blocks;

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAFAFB] via-white to-[#F5F3FF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#75619D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your event...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAFAFB] via-white to-[#F5F3FF] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-[#75619D] text-white rounded-lg hover:bg-[#624F8A] transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFB] via-white to-[#F5F3FF]">

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all transform ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <span>{notification.type === 'success' ? '✓' : '✗'}</span>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

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
      <main className="flex max-w-7xl mx-auto relative">
        {/* Left Sidebar - Block Suggestions - ALWAYS RENDER for toggle button visibility */}
        {user?.id === event?.organizerId && (
          <BlockSuggestionsSidebar
            loadingSuggestions={loadingSuggestions}
            suggestions={suggestions}
            existingBlocks={blocks}
            isOpen={sidebarOpen}                           
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}  
            onSuggestionClick={handleSuggestionClick}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onAddBlock={async (blockType) => {
              const getSize = (type: string) => {
                switch (type) {
                  case 'image': return { w: 8, h: 8 }; // Square for images
                  case 'time': return { w: 12, h: 10 }; // Wide for calendar
                  case 'location': return { w: 8, h: 6 }; // Medium rectangle
                  case 'budget': return { w: 6, h: 6 }; // Square for budget
                  case 'task': return { w: 8, h: 8 }; // Square for task list
                  case 'note': return { w: 8, h: 6 }; // Medium rectangle
                  default: return { w: 8, h: 6 }; // Default size
                }
              };

              if (blockType === 'time') {
                setShowTimeBlockModal(true);
              } else if (blockType === 'task') {
                setShowTaskSuggestionsModal(true);
              } else {
                const size = getSize(blockType);
                const nextY = blocks.length > 0 ? Math.max(...blocks.map(b => b.layout.y + b.layout.h)) : 0;
                const authorId = user?.id || participantId || 'anonymous';

                let newBlock: any;
                if (blockType === 'location') {
                  newBlock = {
                    type: 'location' as const,
                    title: 'Location',
                    content: { options: [] },
                    layout: { x: 0, y: nextY, ...size },
                    order: blocks.length,
                    author: authorId
                  };
                } else if (blockType === 'budget') {
                  newBlock = {
                    type: 'budget' as const,
                    title: 'Budget',
                    content: { responses: [] },
                    layout: { x: 0, y: nextY, ...size },
                    order: blocks.length,
                    author: authorId
                  };
                } else if (blockType === 'image') {
                  newBlock = {
                    type: 'image' as const,
                    title: 'Photo Gallery',
                    content: { images: [], allowParticipantUploads: true },
                    layout: { x: 0, y: nextY, ...size },
                    order: blocks.length,
                    author: authorId
                  };
                } else if (blockType === 'note') {
                  newBlock = {
                    type: 'note' as const,
                    title: 'Notes',
                    content: { text: '', comments: [] },
                    layout: { x: 0, y: nextY, ...size },
                    order: blocks.length,
                    author: authorId
                  };
                }

                if (newBlock) {
                  await addBlock(id!, newBlock);
                  const updatedBlocks = await getBlocks(id!);
                  setBlocks(updatedBlocks);
                }
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
            onEditFixedTimeBlock={() => {
              if (!fixedTimeBlock) return;
              setEditingFixedBlockId(fixedTimeBlock.id);
              setShowTimeBlockModal(true);
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

          {/* Event Canvas with Blocks */}
          <div
            onDragOver={handleCanvasDragOver}
            onDrop={handleCanvasDrop}
            className={`transition-all rounded-lg ${
              isDragging 
                ? 'ring-4 ring-[#75619D] ring-opacity-70 bg-[#75619D]/5 relative' 
                : ''
            }`}
          >
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-[#75619D] text-white px-6 py-3 rounded-lg shadow-lg">
                  <span className="text-sm font-medium">Drop here to add block</span>
                </div>
              </div>
            )}
            <EventCanvas
              blocks={canvasBlocks}
              isOrganizer={user?.id === event?.organizerId}
              eventName={eventName}
              currentUserId={user?.id || participantId || undefined}
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
          initialConfig={editingFixedBlockId ? (blocks.find(b => b.id === editingFixedBlockId) as any)?.content : undefined}
          onClose={() => {
            setShowTimeBlockModal(false);
            setDraggingSuggestion(null);
            setIsDragging(false);
            setEditingFixedBlockId(null);
          }}
          onConfirm={async (config) => {
            // If editing an existing fixed time block, update it instead of adding
            if (editingFixedBlockId && id) {
              try {
                await updateBlock(id, editingFixedBlockId, { content: config } as any);
                const updatedBlocks = await getBlocks(id);
                setBlocks(updatedBlocks);
              } finally {
                setEditingFixedBlockId(null);
                setShowTimeBlockModal(false);
              }
              return;
            }

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
                title: 'Tasks',
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
                title: 'Tasks',
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