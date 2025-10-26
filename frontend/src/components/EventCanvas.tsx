import React, { useCallback, useRef, useEffect, useState } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { Timestamp } from 'firebase/firestore';
import type { Block, TimeBlock, LocationBlock as LocationBlockType, BudgetBlock as BudgetBlockType, TaskBlock as TaskBlockType, NoteBlock as NoteBlockType, BlockLayout } from '../types/block';
import { ChevronDown, ChevronUp } from 'lucide-react';
import AvailabilityHeatmap from './AvailabilityHeatmap';
import LocationBlock from './LocationBlock';
import BudgetBlock from './BudgetBlock';
import TaskBlock from './TaskBlock';
import NoteBlock from './NoteBlock';
import FixedDateTimeDisplay from './FixedDateTimeDisplay';
import ImageBlock from './ImageBlock';
import { GripVertical, X } from 'lucide-react';

interface EventCanvasProps {
  blocks: Block[];
  isOrganizer: boolean;
  currentUserId?: string;
  eventName?: string;
  onLayoutChange?: (blockId: string, layout: BlockLayout) => void;
  onBlockUpdate?: (blockId: string, updates: Partial<Block>) => void;
  onBlockDelete?: (blockId: string) => void;
  onSelectTimeSlot?: (date: string, startTime: string, endTime: string) => void;
}

export default function EventCanvas({ blocks, isOrganizer, currentUserId, eventName, onLayoutChange, onBlockUpdate, onBlockDelete, onSelectTimeSlot }: EventCanvasProps) {
  // Track collapsed state for each block
  const [collapsedBlocks, setCollapsedBlocks] = useState<Set<string>>(new Set());

  // Toggle collapse state for a block
  const toggleCollapse = (blockId: string) => {
    setCollapsedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        newSet.delete(blockId);
      } else {
        newSet.add(blockId);
      }
      return newSet;
    });
  };

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

  // Convert blocks to react-grid-layout format with finer positioning
  // Sort by order so latest blocks appear on top (higher z-index)
  const sortedBlocks = [...blocks].sort((a, b) => b.order - a.order);
  
  const layout: Layout[] = sortedBlocks.map(block => ({
    i: block.id,
    x: block.layout.x,
    y: block.layout.y,
    w: block.layout.w,
    h: block.layout.h,
    static: !isOrganizer, // Only organizer can move blocks
    z: block.order // Use order for z-index (higher = on top)
  }));

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    if (!isOrganizer || !onLayoutChange) return;

    newLayout.forEach(item => {
      const block = sortedBlocks.find(b => b.id === item.i);
      if (block) {
        // Convert back from fine-grained positioning
        const newX = Math.round(item.x);
        const newY = Math.round(item.y);
        const newW = Math.round(item.w);
        const newH = Math.round(item.h);

        const hasChanged =
          block.layout.x !== newX ||
          block.layout.y !== newY ||
          block.layout.w !== newW ||
          block.layout.h !== newH;

        if (hasChanged) {
          onLayoutChange(item.i, {
            x: newX,
            y: newY,
            w: newW,
            h: newH
          });
        }
      }
    });
  }, [sortedBlocks, isOrganizer, onLayoutChange]);

  // responsive grid width to avoid horizontal scroll on narrow viewports
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(() => {
    try {
      return Math.min(1000, typeof window !== 'undefined' ? window.innerWidth - 64 : 1000);
    } catch {
      return 1000;
    }
  });

  useEffect(() => {
    function measure() {
      const el = containerRef.current;
      if (!el) return;
      const w = el.clientWidth || Math.min(1000, window.innerWidth - 40);
      setContainerWidth(w);
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // --- Theming: detect keywords in event name and load theme images ---
  const [matchedThemeUrl, setMatchedThemeUrl] = useState<string | null>(null);

  // Load any images placed in src/assets/themes using Vite's glob import (eager)
  // This lets the user drop files into that folder and they'll be available here.
  const themeModules = import.meta.glob('../assets/themes/*.{png,jpg,jpeg,webp}', { eager: true }) as Record<string, any>;
  const themeUrls: string[] = Object.values(themeModules).map(m => (m && m.default) || m).filter(Boolean);

  // Keywords that should trigger a themed background (case-insensitive)
  const THEME_KEYWORDS = ['birthday', 'gender reveal', 'thanksgiving'];

  // When the event name changes, check for keywords and pick a theme image if available
  useEffect(() => {
    if (!eventName || typeof eventName !== 'string') {
      setMatchedThemeUrl(null);
      return;
    }

    const lower = eventName.toLowerCase();
    const hasKeyword = THEME_KEYWORDS.some(k => lower.includes(k));
    if (!hasKeyword || themeUrls.length === 0) {
      setMatchedThemeUrl(null);
      return;
    }

    // Normalize helper: lower-case and remove non-alphanumeric chars
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Prepare normalized filenames map
    const normalizedUrlMap = themeUrls.map(u => ({
      url: u,
      name: normalize(u.split('/').pop() || u)
    }));

    // Try to find an image file whose normalized filename contains the normalized keyword
    let chosen: string | undefined;
    for (const k of THEME_KEYWORDS) {
      const nk = normalize(k);
      if (!lower.includes(k)) continue; // only consider keywords present in event name
      const match = normalizedUrlMap.find(n => n.name.includes(nk));
      if (match) {
        chosen = match.url;
        break;
      }
    }

    // Fallback to a random theme if no filename matched
    if (!chosen) {
      chosen = themeUrls[Math.floor(Math.random() * themeUrls.length)];
    }

    // debug: log matching for development (open browser console to inspect)
    try {
      // eslint-disable-next-line no-console
      console.debug('[EventCanvas] eventName:', eventName, 'themeUrls:', themeUrls, 'chosenTheme:', chosen, 'normalizedMap:', normalizedUrlMap.map(n=>n.name));
    } catch {}

    setMatchedThemeUrl(chosen || null);
  }, [eventName, themeUrls.join('|')]);


  const renderBlock = (block: Block) => {
    // Render TimeBlock
    if (block.type === 'time') {
      const tb = block as TimeBlock;

      // Fixed date/time mode
      if (tb.content.mode === 'fixed') {
        return (
          <div className="h-full">
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
        const availability = (tb.content.availability || []).map(a => ({
          ...a,
          submittedAt: a.submittedAt.toDate()
        }));

        console.log('=== RENDERING TIMEBLOCK ===');
        console.log('Block ID:', tb.id);
        console.log('Dates:', dates);
        console.log('Availability array:', availability);
        console.log('Availability length:', availability.length);

        return (
          <div className="h-full">
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
            {String(block.type).toUpperCase()} BLOCK
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
        <div className="h-full">
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
        <div className="h-full">
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
        <div className="h-full">
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

    // Render ImageBlock
    if ((block as any).type === 'image') {
      const ib = block as any;

      return (
        <div className="h-full">
          <ImageBlock
            blockId={block.id}
            initialImages={ib.content?.images || []}
            isOrganizer={isOrganizer}
            allowParticipantUploads={ib.content?.allowParticipantUploads ?? true}
            currentUserId={currentUserId || ''}
            currentUserName={participantNames.get(currentUserId || '') || 'Anonymous'}
            onChange={(images) => {
              onBlockUpdate?.(block.id, {
                content: { ...(ib.content || {}), images }
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

      return (
        <div className="h-full">
          <NoteBlock
            text={nb.content.text || ''}
            lastEditedBy={nb.content.lastEditedBy}
            comments={nb.content.comments || []}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            isOrganizer={isOrganizer}
            onNoteChange={(updatedText, updatedComments, lastEditedBy) => {
              onBlockUpdate?.(block.id, {
                content: {
                  text: updatedText,
                  comments: updatedComments,
                  lastEditedBy
                }
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

  // Note: Do NOT early-return here. React hooks must be called in the same order
  // on every render. We'll render the empty-state UI inside the main return so
  // hooks declared above always run.

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete with backspace when a block is selected (no confirmation for speed)
      if (e.key === 'Backspace' && isOrganizer && blocks.length > 0) {
        const lastBlock = blocks[blocks.length - 1];
        onBlockDelete?.(lastBlock.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [blocks, isOrganizer, onBlockDelete]);

  return (
    <div ref={containerRef} className="relative max-w-6xl mx-auto px-4">
      {/* Theme image overlay (when a matching keyword is detected in the event name) */}
      {matchedThemeUrl && (
        // theme overlay should sit behind blocks so the canvas shows the image while blocks remain opaque
        <div className="absolute inset-0 -z-20 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${matchedThemeUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.40,
              mixBlendMode: 'overlay',
              filter: 'saturate(1.05) blur(2px)'
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06), transparent 10%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.04), transparent 20%)',
              animation: 'canvasFloat 10s ease-in-out infinite'
            }}
          />
          {/* decorative sparkles */}
          <div className="absolute inset-0 pointer-events-none">
            <span className="sparkle" style={{left: '10%', top: '15%'}} />
            <span className="sparkle" style={{left: '30%', top: '60%'}} />
            <span className="sparkle" style={{left: '70%', top: '25%'}} />
            <span className="sparkle" style={{left: '85%', top: '75%'}} />
          </div>
        </div>
      )}

  {/* base gradient should sit behind everything */}
  <div className="absolute inset-0 bg-gradient-to-tr from-[#75619D]/5 via-transparent to-[#9D61A4]/5 rounded-3xl -z-40"></div>

      <style>{`
        @keyframes canvasFloat {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        .sparkle {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0) 60%);
          box-shadow: 0 0 12px rgba(255,255,255,0.5);
          opacity: 0.9;
          transform: translate3d(0,0,0);
          animation: sparkleAnim 3.5s ease-in-out infinite;
        }
        .sparkle:nth-child(2) { animation-delay: 0.6s; }
        .sparkle:nth-child(3) { animation-delay: 1.2s; }
        .sparkle:nth-child(4) { animation-delay: 1.8s; }
        @keyframes sparkleAnim {
          0% { transform: translateY(0) scale(0.8); opacity: 0.6; }
          50% { transform: translateY(-8px) scale(1.15); opacity: 1; }
          100% { transform: translateY(0) scale(0.8); opacity: 0.6; }
        }
      `}</style>
      {sortedBlocks.length === 0 ? (
        <div className="text-center py-24 px-4">
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#75619D]/20 to-[#9D61A4]/20 rounded-3xl transform rotate-6 animate-pulse"></div>
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl border border-[#75619D]/10 shadow-xl flex items-center justify-center">
              <GripVertical className="w-12 h-12 text-[#75619D] opacity-40" />
            </div>
          </div>
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#75619D] to-[#9D61A4] mb-3">
            Your canvas is empty
          </h3>
          <p className="text-base text-gray-600 max-w-md mx-auto">
            {isOrganizer
              ? 'Start building your event by dragging blocks from the sidebar. Each block adds a new dimension to your planning canvas.'
              : "The organizer is still crafting this event's experience. Check back soon!"}
          </p>
        </div>
      ) : (
      <GridLayout
        className="layout"
        layout={layout}
        cols={24} // 24 columns for a standard grid
        rowHeight={30} // 30px row height (more natural sizing)
        width={containerWidth}
        onLayoutChange={handleLayoutChange}
        isDraggable={isOrganizer}
        isResizable={isOrganizer}
        resizeHandles={['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']} // Enable all resize handles
        compactType={null} // Disable automatic compacting
        preventCollision={false} // Allow overlap; enable free-form placement
        allowOverlap={true}
        margin={[0, 0]} // Remove margin between blocks
        containerPadding={[0, 0]}
        draggableHandle=".drag-handle"
        autoSize={true} // Allow container to grow
        verticalCompact={false} // Disable vertical compacting
        useCSSTransforms={true} // Smoother animations
      >
        {sortedBlocks.map(block => (
          <div
              key={block.id}
              className="group relative rounded-xl border border-gray-100/20 shadow-lg overflow-visible hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 min-h-[200px] flex flex-col"
              style={{
                // keep blocks fully opaque and readable over the canvas background
                background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 1))',
                boxShadow: '0 4px 32px rgba(0, 0, 0, 0.04)',
                zIndex: block.order // Latest blocks appear on top
              }}
            >
            {/* Block Header */}
            <div className="bg-gradient-to-r from-[#75619D]/5 to-[#9D61A4]/5 px-3 py-2 flex items-center justify-between">
              <div className={`flex items-center gap-3 flex-1 ${isOrganizer ? 'drag-handle cursor-move' : ''}`}>
                {isOrganizer && <GripVertical className="w-4 h-4 text-[#75619D] opacity-50 group-hover:opacity-100 transition-opacity" />}
                <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#75619D] to-[#9D61A4]">
                  {block.title || String(block.type).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleCollapse(block.id);
                  }}
                  className="p-1.5 hover:bg-[#75619D]/10 rounded-lg transition-colors z-10 opacity-0 group-hover:opacity-100"
                  title={collapsedBlocks.has(block.id) ? "Expand block" : "Collapse block"}
                >
                  {collapsedBlocks.has(block.id) ? (
                    <ChevronDown className="w-4 h-4 text-[#75619D]" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-[#75619D]" />
                  )}
                </button>
                {isOrganizer && (
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Show custom confirmation
                // No confirmation - just delete for speed
                onBlockDelete?.(block.id);
                    }}
                    className="p-1.5 hover:bg-red-100 rounded-lg transition-colors z-10 opacity-0 group-hover:opacity-100"
                    title="Delete block"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                )}
              </div>
            </div>
            <div 
              className={`transition-all duration-300 ease-in-out ${
                collapsedBlocks.has(block.id) 
                  ? 'h-0 p-0 opacity-0' 
                  : 'p-4 opacity-100'
              } overflow-visible`}
            >
              {!collapsedBlocks.has(block.id) && renderBlock(block)}
            </div>
          </div>
        ))}
      </GridLayout>
      )}
    </div>
  );
}
