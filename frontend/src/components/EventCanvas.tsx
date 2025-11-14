import { useCallback, useRef, useState, useEffect } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { Timestamp } from 'firebase/firestore';
import type { Block, TimeBlock, LocationBlock as LocationBlockType, BudgetBlock as BudgetBlockType, TaskBlock as TaskBlockType, NoteBlock as NoteBlockType, RSVPBlock as RSVPBlockType, AlbumBlock as AlbumBlockType, PollBlock as PollBlockType, PotluckBlock as PotluckBlockType, BlockLayout } from '../types/block';
import AvailabilityHeatmap from './AvailabilityHeatmap';
import LocationBlock from './LocationBlock';
import BudgetBlock from './BudgetBlock';
import TaskBlock from './TaskBlock';
import NoteBlock from './NoteBlock';
import RSVPBlock from './RSVPBlock';
import SharedAlbumBlock from './SharedAlbumBlock';
import PollBlock from './PollBlock';
import PotluckBlock from './PotluckBlock';
import FixedDateTimeDisplay from './FixedDateTimeDisplay';
import { GripVertical, X } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
}

interface EventCanvasProps {
  blocks: Block[];
  isOrganizer: boolean;
  currentUserId?: string;
  eventId?: string;
  organizerId?: string;
  organizerName?: string;
  participants?: Participant[];
  onLayoutChange?: (blockId: string, layout: BlockLayout) => void;
  onBlockUpdate?: (blockId: string, updates: Partial<Block>) => void;
  onBlockDelete?: (blockId: string) => void;
  onSelectTimeSlot?: (date: string, startTime: string, endTime: string) => void;
  onRemoveParticipant?: (participantId: string) => void;
  onAddParticipant?: (name: string) => void;
}

export default function EventCanvas({ blocks, isOrganizer, currentUserId, eventId, organizerId, organizerName, participants = [], onLayoutChange, onBlockUpdate, onBlockDelete, onSelectTimeSlot, onRemoveParticipant, onAddParticipant }: EventCanvasProps) {
  // Track dragging state to optimize updates
  const [isDragging, setIsDragging] = useState(false);
  const layoutUpdateTimeout = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdates = useRef<Map<string, BlockLayout>>(new Map());

  // Calculate responsive width based on viewport
  const [canvasWidth, setCanvasWidth] = useState(1000);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateWidth = () => {
      const mobile = window.innerWidth < 768; // Mobile breakpoint
      // Account for padding: mobile has 16px on each side (sm:px-6 = 24px on larger screens)
      const padding = mobile ? 32 : 48; // px-4 = 16px each side, sm:px-6 = 24px each side
      const width = Math.min(1000, window.innerWidth - padding);
      setCanvasWidth(width);
      setIsMobile(mobile);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Build participant name map from participants array and TimeBlock availability
  const participantNames = new Map<string, string>();

  // First, add all participants from the participants array
  participants.forEach(participant => {
    participantNames.set(participant.id, participant.name);
  });

  // Then add from TimeBlock availability (may override if names differ)
  blocks.forEach(block => {
    if (block.type === 'time') {
      const tb = block as TimeBlock;
      tb.content.availability?.forEach(participant => {
        participantNames.set(participant.participantId, participant.participantName);
      });
    }
  });

  // Convert blocks to react-grid-layout format
  const layout: Layout[] = blocks.map(block => ({
    i: block.id,
    x: isMobile ? 0 : block.layout.x, // Force to left edge on mobile
    y: block.layout.y,
    w: isMobile ? 12 : block.layout.w, // Full width on mobile
    h: block.layout.h,
    minW: 2, // Minimum width
    minH: 2, // Minimum height
    maxW: 12, // Maximum width (full canvas width)
    static: !isOrganizer // Only organizer can move blocks
  }));

  // Debounced layout change handler
  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    if (!isOrganizer || !onLayoutChange) return;

    // Collect all changes
    newLayout.forEach(item => {
      const block = blocks.find(b => b.id === item.i);
      if (block) {
        // Ensure block stays within canvas bounds (12 columns)
        const clampedW = Math.min(item.w, 12);
        const clampedX = Math.min(item.x, 12 - clampedW);

        const hasChanged =
          block.layout.x !== clampedX ||
          block.layout.y !== item.y ||
          block.layout.w !== clampedW ||
          block.layout.h !== item.h;

        if (hasChanged) {
          pendingUpdates.current.set(item.i, {
            x: clampedX,
            y: item.y,
            w: clampedW,
            h: item.h
          });
        }
      }
    });

    // Clear existing timeout
    if (layoutUpdateTimeout.current) {
      clearTimeout(layoutUpdateTimeout.current);
    }

    // Debounce: only save after user stops dragging for 500ms
    layoutUpdateTimeout.current = setTimeout(() => {
      pendingUpdates.current.forEach((layout, blockId) => {
        onLayoutChange(blockId, layout);
      });
      pendingUpdates.current.clear();
    }, 500);
  }, [blocks, isOrganizer, onLayoutChange]);

  // Handle drag start/stop for visual feedback
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragStop = useCallback(() => {
    setIsDragging(false);
  }, []);

  const renderBlock = (block: Block) => {
    // Render TimeBlock
    if (block.type === 'time') {
      const tb = block as TimeBlock;

      // Fixed date/time mode
      if (tb.content.mode === 'fixed') {
        return (
          <div className="h-full overflow-auto">
            <FixedDateTimeDisplay
              date={tb.content.fixedDate || new Date().toISOString().split('T')[0]}
              startTime={tb.content.fixedStartTime || '09:00'}
              endTime={tb.content.fixedEndTime || '17:00'}
              timezone={tb.content.fixedTimezone || 'America/New_York'}
            />
          </div>
        );
      }

      // Availability mode
      if (tb.content.mode === 'availability') {
        const dateType = tb.content.dateType || 'specific';
        const dates = dateType === 'specific'
          ? (tb.content.selectedDates || [])
          : (tb.content.selectedDays || []);
        const availability = (tb.content.availability || []).map(a => ({
          ...a,
          submittedAt: a.submittedAt.toDate()
        }));

        console.log('=== RENDERING TIMEBLOCK ===');
        console.log('Block ID:', tb.id);
        console.log('Date Type:', dateType);
        console.log('Dates:', dates);
        console.log('Availability array:', availability);
        console.log('Availability length:', availability.length);

        return (
          <div className="h-full overflow-auto">
            <AvailabilityHeatmap
              availability={availability}
              dates={dates}
              dateType={dateType}
              startTime={tb.content.startTime || '09:00'}
              endTime={tb.content.endTime || '17:00'}
              intervalMinutes={tb.content.intervalMinutes || 30}
              isOrganizer={isOrganizer}
              onSelectTimeSlot={onSelectTimeSlot}
            />
          </div>
        );
      }

      // Fallback for other modes
      return (
        <div className="h-full flex flex-col">
          <div className="text-sm font-medium text-gray-700">
            {block.type.toUpperCase()} BLOCK
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {block.title || 'Untitled'}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Mode "{tb.content.mode}" not yet implemented
          </div>
        </div>
      );
    }

    // Render LocationBlock
    if (block.type === 'location') {
      const lb = block as LocationBlockType;
      return (
        <div className="h-full overflow-auto">
          <LocationBlock
            options={lb.content.options}
            editable={isOrganizer}
            currentUserId={currentUserId}
            organizerId={organizerId}
            participantNames={participantNames}
            allowParticipantSuggestions={lb.content.allowParticipantSuggestions ?? true}
            onOptionsChange={(options) => {
              onBlockUpdate?.(block.id, {
                content: { ...lb.content, options }
              });
            }}
            onSettingsChange={(settings) => {
              onBlockUpdate?.(block.id, {
                content: { ...lb.content, ...settings }
              });
            }}
          />
        </div>
      );
    }

    // Render BudgetBlock
    if (block.type === 'budget') {
      const bb = block as BudgetBlockType;
      const currentUserName = participantNames.get(currentUserId || '') || currentUserId || 'Unknown';

      return (
        <div className="h-full overflow-auto">
          <BudgetBlock
            responses={bb.content.responses || []}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            isOrganizer={isOrganizer}
            showResponsesToParticipants={bb.content.showResponsesToParticipants ?? false}
            onResponseChange={(budgetLevel) => {
              if (!currentUserId) return;

              const otherResponses = (bb.content.responses || []).filter(
                r => r.participantId !== currentUserId
              );

              const updatedResponses = [
                ...otherResponses,
                {
                  participantId: currentUserId,
                  participantName: currentUserName,
                  budgetLevel,
                  submittedAt: Timestamp.now()
                }
              ];

              onBlockUpdate?.(block.id, {
                content: { ...bb.content, responses: updatedResponses }
              });
            }}
            onSettingsChange={(settings) => {
              onBlockUpdate?.(block.id, {
                content: { ...bb.content, ...settings }
              });
            }}
          />
        </div>
      );
    }

    // Render TaskBlock
    if (block.type === 'task') {
      const tb = block as TaskBlockType;
      const currentUserName = participantNames.get(currentUserId || '') || 'You';

      return (
        <div className="h-full overflow-auto">
          <TaskBlock
            tasks={tb.content.tasks || []}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            participantNames={participantNames}
            isOrganizer={isOrganizer}
            onTasksChange={(tasks) => {
              onBlockUpdate?.(block.id, {
                content: { tasks }
              });
            }}
          />
        </div>
      );
    }

    // Render NoteBlock
    if (block.type === 'note') {
      const nb = block as NoteBlockType;
      const currentUserName = participantNames.get(currentUserId || '') || currentUserId || 'Anonymous';
      // Convert lastEditedBy ID to name
      const lastEditedByName = nb.content.lastEditedBy
        ? participantNames.get(nb.content.lastEditedBy) || nb.content.lastEditedBy
        : undefined;

      return (
        <div className="h-full overflow-auto">
          <NoteBlock
            text={nb.content.text || ''}
            lastEditedBy={lastEditedByName}
            comments={nb.content.comments || []}
            likes={nb.content.likes || []}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            isOrganizer={isOrganizer}
            onNoteChange={(updatedText, updatedComments, lastEditedBy, likes) => {
              onBlockUpdate?.(block.id, {
                content: {
                  text: updatedText,
                  comments: updatedComments,
                  lastEditedBy,
                  likes
                }
              });
            }}
          />
        </div>
      );
    }

    // Render RSVPBlock
    if (block.type === 'rsvp') {
      // Filter out organizer from participants list
      const filteredParticipants = organizerId
        ? participants.filter(p => p.id !== organizerId)
        : participants;

      return (
        <div className="h-full overflow-auto">
          <RSVPBlock
            participants={filteredParticipants}
            currentUserId={currentUserId}
            isOrganizer={isOrganizer}
            onRemoveParticipant={onRemoveParticipant}
            onAddParticipant={onAddParticipant}
          />
        </div>
      );
    }

    // Render AlbumBlock
    if (block.type === 'album') {
      const ab = block as AlbumBlockType;
      const currentUserName = participantNames.get(currentUserId || '') || currentUserId || 'Anonymous';

      return (
        <div className="h-full overflow-auto">
          <SharedAlbumBlock
            images={ab.content.images || []}
            isOrganizer={isOrganizer}
            allowParticipantUploads={ab.content.allowParticipantUploads ?? true}
            currentUserName={currentUserName}
            eventId={eventId}
            onChange={(images, allowUploads) => {
              onBlockUpdate?.(block.id, {
                content: { images, allowParticipantUploads: allowUploads }
              });
            }}
          />
        </div>
      );
    }

    // Render PollBlock
    if (block.type === 'poll') {
      const pb = block as PollBlockType;
      const currentUserName = participantNames.get(currentUserId || '') || currentUserId || 'Anonymous';

      return (
        <div className="h-full overflow-auto">
          <PollBlock
            question={pb.content.question || ''}
            options={pb.content.options || []}
            allowMultipleVotes={pb.content.allowMultipleVotes ?? false}
            allowParticipantOptions={pb.content.allowParticipantOptions ?? true}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            isOrganizer={isOrganizer}
            onChange={(question, options, allowMultipleVotes, allowParticipantOptions) => {
              onBlockUpdate?.(block.id, {
                content: { question, options, allowMultipleVotes, allowParticipantOptions }
              });
            }}
          />
        </div>
      );
    }

    // Render PotluckBlock
    if (block.type === 'potluck') {
      const plb = block as PotluckBlockType;
      const currentUser = participants.find(p => p.id === currentUserId);
      // If user is organizer, use organizerName; otherwise look up from participants
      const currentUserName = (isOrganizer && currentUserId === organizerId && organizerName)
        ? organizerName
        : (currentUser?.name || participantNames.get(currentUserId || '') || currentUserId || 'Anonymous');

      return (
        <div className="h-full overflow-auto">
          <PotluckBlock
            items={plb.content.items || []}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            participants={participants}
            isOrganizer={isOrganizer}
            onItemsChange={(items) => {
              onBlockUpdate?.(block.id, {
                content: { items }
              });
            }}
          />
        </div>
      );
    }

    // Placeholder for other block types
    return (
      <div className="h-full flex flex-col">
        <div className="text-sm font-medium text-gray-700">
          {String(block.type).toUpperCase()} BLOCK
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {block.title || 'Untitled'}
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Block rendering not yet implemented
        </div>
      </div>
    );
  };

  if (blocks.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 px-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <GripVertical className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
          Your canvas is empty
        </h3>
        <p className="text-xs sm:text-sm text-gray-500">
          {isOrganizer
            ? 'Tap "Add a Block" to build your event page'
            : "The organizer hasn't added any blocks yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={100}
        width={canvasWidth}
        onLayoutChange={handleLayoutChange}
        onDragStart={handleDragStart}
        onDragStop={handleDragStop}
        onResizeStart={handleDragStart}
        onResizeStop={handleDragStop}
        isDraggable={isOrganizer}
        isResizable={isOrganizer}
        compactType={null}
        preventCollision={false}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        draggableHandle=".drag-handle"
        useCSSTransforms={true}
        transformScale={1}
        allowOverlap={true}
      >
        {blocks.map(block => (
          <div
            key={block.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:border-[#75619D] transition-colors"
          >
            {/* Block Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between">
              <div className={`flex items-center gap-2 flex-1 ${isOrganizer ? 'drag-handle cursor-move hover:bg-gray-100' : ''}`}>
                {isOrganizer && <GripVertical className="w-4 h-4 text-gray-400" />}
                <span className="text-xs font-medium text-gray-600">
                  {block.title || block.type.toUpperCase()}
                </span>
              </div>
              {isOrganizer && (
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this block?')) {
                      onBlockDelete?.(block.id);
                    }
                  }}
                  className="p-1 hover:bg-gray-200 rounded transition-colors z-10"
                  title="Delete block"
                >
                  <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                </button>
              )}
            </div>
            <div className="p-4 h-[calc(100%-40px)]">
              {renderBlock(block)}
            </div>
          </div>
        ))}
      </GridLayout>
    </div>
  );
}
