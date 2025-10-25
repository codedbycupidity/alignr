import { useState, useCallback } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import type { Block, TimeBlock, BlockLayout } from '../types/block';
import AvailabilityHeatmap from './AvailabilityHeatmap';
import { GripVertical } from 'lucide-react';

interface EventCanvasProps {
  blocks: Block[];
  isOrganizer: boolean;
  onLayoutChange?: (blockId: string, layout: BlockLayout) => void;
}

export default function EventCanvas({ blocks, isOrganizer, onLayoutChange }: EventCanvasProps) {
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
    // Render TimeBlock with availability heatmap
    if (block.type === 'time' && block.content.mode === 'availability') {
      const tb = block as TimeBlock;
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
            {isOrganizer && (
              <div className="drag-handle bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center gap-2 cursor-move hover:bg-gray-100 transition-colors">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-600">
                  {block.title || block.type.toUpperCase()}
                </span>
              </div>
            )}
            <div className={`p-4 ${isOrganizer ? 'h-[calc(100%-40px)]' : 'h-full'}`}>
              {renderBlock(block)}
            </div>
          </div>
        ))}
      </GridLayout>
    </div>
  );
}
