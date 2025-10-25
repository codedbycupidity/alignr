import { useState, useCallback } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import type { Block, TimeBlock, LocationBlock, BudgetBlock as BudgetBlockType, TaskBlock as TaskBlockType, BlockLayout } from '../types/block';
import AvailabilityHeatmap from './AvailabilityHeatmap';
import LocationBlock from './LocationBlock';
import BudgetBlock from './BudgetBlock';
import TaskBlock from './TaskBlock';
import FixedDateTimeDisplay from './FixedDateTimeDisplay';
import { GripVertical, X } from 'lucide-react';

interface EventCanvasProps {
  blocks: Block[];
  isOrganizer: boolean;
  currentUserId?: string;
  onLayoutChange?: (blockId: string, layout: BlockLayout) => void;
  onBlockUpdate?: (blockId: string, updates: Partial<Block>) => void;
  onBlockDelete?: (blockId: string) => void;
  onSelectTimeSlot?: (date: string, startTime: string, endTime: string) => void;
}

export default function EventCanvas({ blocks, isOrganizer, currentUserId, onLayoutChange, onBlockUpdate, onBlockDelete, onSelectTimeSlot }: EventCanvasProps) {
  // Build participant name map from TimeBlock availability
  const participantNames = new Map<string, string>();
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
    x: block.layout.x,
    y: block.layout.y,
    w: block.layout.w,
    h: block.layout.h,
    static: !isOrganizer // Only organizer can move blocks
  }));

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    if (!isOrganizer || !onLayoutChange) return;

    newLayout.forEach(item => {
      const block = blocks.find(b => b.id === item.i);
      if (block) {
        const hasChanged =
          block.layout.x !== item.x ||
          block.layout.y !== item.y ||
          block.layout.w !== item.w ||
          block.layout.h !== item.h;

        if (hasChanged) {
          onLayoutChange(item.i, {
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h
          });
        }
      }
    });
  }, [blocks, isOrganizer, onLayoutChange]);

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
        const dates = tb.content.selectedDates || [];
        const availability = tb.content.availability || [];

        console.log('=== RENDERING TIMEBLOCK ===');
        console.log('Block ID:', tb.id);
        console.log('Dates:', dates);
        console.log('Availability array:', availability);
        console.log('Availability length:', availability.length);

        return (
          <div className="h-full overflow-auto">
            <AvailabilityHeatmap
              availability={availability}
              dates={dates}
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
      const lb = block as LocationBlock;
      return (
        <div className="h-full overflow-auto">
          <LocationBlock
            options={lb.content.options}
            editable={isOrganizer}
            currentUserId={currentUserId}
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
      const currentUserName = participantNames.get(currentUserId || '') || 'You';

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
                  submittedAt: new Date() as any
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

    // Placeholder for other block types
    return (
      <div className="h-full flex flex-col">
        <div className="text-sm font-medium text-gray-700">
          {block.type.toUpperCase()} BLOCK
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
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <GripVertical className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Your canvas is empty
        </h3>
        <p className="text-sm text-gray-500">
          {isOrganizer
            ? 'Drag blocks from the sidebar to build your event page'
            : "The organizer hasn't added any blocks yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="relative max-w-5xl">
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={100}
        width={1000}
        onLayoutChange={handleLayoutChange}
        isDraggable={isOrganizer}
        isResizable={isOrganizer}
        compactType={null}
        preventCollision={false}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        draggableHandle=".drag-handle"
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
