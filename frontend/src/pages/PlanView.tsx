import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  Share2,
  CheckCircle2,
  Plus,
  Sparkles,
  Loader2,
  Check,
  X as XIcon,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getEvent, getBlocks, addBlock, updateEvent, updateBlock } from '../services/events';
import { suggestBlocks, type BlockSuggestion } from '../services/gemini';
import type { EventData } from '../services/events';
import type { Block, TimeBlock, TimeBlockContent, BlockLayout } from '../types/block';
import EventCanvas from '../components/EventCanvas';
import AddTimeBlockModal from '../components/AddTimeBlockModal';

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
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [draggingSuggestion, setDraggingSuggestion] = useState<BlockSuggestion | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadEventData = async () => {
      try {
        console.log('Loading event:', id);

        // Load event and blocks in parallel
        const [eventData, blocksData] = await Promise.all([
          getEvent(id),
          getBlocks(id)
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
        console.log('Loaded blocks:', blocksData);
      } catch (error) {
        console.error('Error loading event data:', error);
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

  const handleSuggestionClick = (suggestion: BlockSuggestion) => {
    console.log('Clicked suggestion:', suggestion);
    if (suggestion.blockType === 'time') {
      console.log('Opening time block modal');
      setShowTimeBlockModal(true);
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

  const handleDragEnd = (e: React.DragEvent) => {
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

  // Find TimeBlock with availability mode
  const timeBlock = blocks.find(
    (block): block is TimeBlock =>
      block.type === 'time' && block.content.mode === 'availability'
  ) as TimeBlock | undefined;

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
      <nav className="bg-white/70 backdrop-blur-md border-b border-white/20 px-6 py-3 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 bg-[#75619D] rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Calendar className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold text-[#1E1E2F] tracking-tight">Alignr</span>
            </Link>
            {user?.id === event?.organizerId && (
              <Link
                to="/dashboard"
                className="text-sm text-gray-600 hover:text-[#75619D] transition-colors"
              >
                ← Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/join/${id}`}
              className="flex items-center space-x-2 px-4 py-2.5 bg-[#75619D] text-white hover:bg-[#75619D]/90 rounded-lg transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md"
            >
              <Users className="w-4 h-4" strokeWidth={2} />
              <span>Join Event</span>
            </Link>
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white/60 backdrop-blur-sm border border-[#75619D]/30 text-[#75619D] hover:bg-white/80 hover:border-[#75619D]/50 rounded-lg transition-all duration-300 text-sm font-medium shadow-sm"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" strokeWidth={2} />
                  <span>Share Link</span>
                </>
              )}
            </button>
            {user && (
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2.5 bg-white/60 backdrop-blur-sm border border-gray-300 text-gray-700 hover:bg-white/80 hover:border-gray-400 rounded-lg transition-all duration-300 text-sm font-medium shadow-sm"
              >
                <LogOut className="w-4 h-4" strokeWidth={2} />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/*Main content */}
      <main className="flex max-w-7xl mx-auto">
        {/* Left Sidebar - Block Suggestions */}
        {user?.id === event?.organizerId && (
          <aside className="w-80 border-r border-gray-200 bg-white px-6 py-8 overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-[#75619D]" />
                <h2 className="text-lg font-bold text-gray-900">Add Blocks</h2>
              </div>
              <p className="text-xs text-gray-500">
                Build your event with scheduling, polls, RSVPs, and more
              </p>
            </div>

            {loadingSuggestions ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-[#75619D] animate-spin mb-3" />
                <p className="text-sm text-gray-600">AI is analyzing...</p>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Suggested for this event
                </p>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, suggestion)}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSuggestionClick(suggestion);
                    }}
                    className="w-full p-3 bg-gray-50 hover:bg-[#75619D]/5 border border-gray-200 hover:border-[#75619D] rounded-lg text-left transition-all group cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h5 className="text-sm font-semibold text-gray-900 group-hover:text-[#75619D] transition-colors">
                        {suggestion.title}
                      </h5>
                      <span className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 text-gray-600 rounded-full">
                        {suggestion.blockType}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{suggestion.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <button
                  onClick={() => setShowTimeBlockModal(true)}
                  className="w-full p-4 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-[#75619D] rounded-lg transition-all"
                >
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Add a Block</p>
                  <p className="text-xs text-gray-500 mt-1">Start building your event</p>
                </button>
              </div>
            )}
          </aside>
        )}

        {/* Main Canvas */}
        <div className="flex-1 px-6 py-8">
          {/* Event Header with Editable Name */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#75619D] rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEventName();
                        if (e.key === 'Escape') handleCancelEditName();
                      }}
                      className="text-3xl font-bold text-[#1E1E2F] tracking-tight border-b-2 border-[#75619D] focus:outline-none bg-transparent"
                      placeholder="Enter event name..."
                    />
                    <button
                      onClick={handleSaveEventName}
                      disabled={savingName}
                      className="p-2 bg-[#75619D] text-white rounded-lg hover:bg-[#75619D]/90 disabled:opacity-50"
                    >
                      {savingName ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={handleCancelEditName}
                      className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <h1
                    onClick={() => user?.id === event?.organizerId && setEditingName(true)}
                    className={`text-3xl font-bold text-[#1E1E2F] tracking-tight ${
                      user?.id === event?.organizerId ? 'cursor-pointer hover:text-[#75619D] transition-colors' : ''
                    }`}
                  >
                    {event?.name || 'Loading...'}
                  </h1>
                )}
                {event?.description && !editingName && (
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                )}
              </div>
            </div>
          {timeBlock && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-[#75619D]" />
              <span>
                {timeBlock.content.selectedDates?.length || 0} {timeBlock.content.selectedDates?.length === 1 ? 'date' : 'dates'} selected
              </span>
              {timeBlock.content.availability && timeBlock.content.availability.length > 0 && (
                <>
                  <span className="text-gray-400">•</span>
                  <Users className="w-4 h-4 text-[#75619D]" />
                  <span>
                    {timeBlock.content.availability.length} {timeBlock.content.availability.length === 1 ? 'participant' : 'participants'}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

          {/* Event Canvas with Blocks */}
          <div
            onDragOver={handleCanvasDragOver}
            onDrop={handleCanvasDrop}
            className={isDragging ? 'ring-2 ring-[#75619D] ring-opacity-50 rounded-lg transition-all' : ''}
          >
            <EventCanvas
              blocks={blocks}
              isOrganizer={user?.id === event?.organizerId}
              onLayoutChange={handleLayoutChange}
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
          onConfirm={(config) => {
            const dropPos = isDragging && draggingSuggestion ? dragPosition : undefined;
            handleAddTimeBlock(config, dropPos);
          }}
          eventName={event.name}
          isDragging={isDragging && draggingSuggestion !== null}
        />
      )}
    </div>
  );
}
