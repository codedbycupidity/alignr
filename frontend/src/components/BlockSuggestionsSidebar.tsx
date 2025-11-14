import { Sparkles, Loader2, Plus, Clock, MapPin, CheckSquare, FileText, BarChart3, Users, DollarSign, ChevronLeft, ChevronRight, Image, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BlockSuggestion } from '../services/gemini';
import type { Block } from '../types/block';

const BLOCK_TYPES = [
  { type: 'time', label: 'Time', icon: Clock, description: 'Schedule & availability' },
  { type: 'location', label: 'Location', icon: MapPin, description: 'Venue suggestions' },
  { type: 'task', label: 'Task', icon: CheckSquare, description: 'To-do lists' },
  { type: 'note', label: 'Note', icon: FileText, description: 'General notes' },
  { type: 'album', label: 'Shared Album', icon: Image, description: 'Upload & share photos' },
  { type: 'poll', label: 'Poll', icon: BarChart3, description: 'Quick decisions' },
  { type: 'rsvp', label: 'RSVP', icon: Users, description: 'Track attendance' },
  { type: 'budget', label: 'Budget', icon: DollarSign, description: 'Split expenses' },
  { type: 'potluck', label: 'Potluck', icon: UtensilsCrossed, description: 'Track food contributions' },
];

interface BlockSuggestionsSidebarProps {
  loadingSuggestions: boolean;
  suggestions: BlockSuggestion[];
  existingBlocks: Block[];
  onSuggestionClick: (suggestion: BlockSuggestion) => void;
  onDragStart: (e: React.DragEvent, suggestion: BlockSuggestion) => void;
  onDrag: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onAddBlock: (blockType: string) => void;
}

export default function BlockSuggestionsSidebar({
  loadingSuggestions,
  suggestions,
  existingBlocks,
  onSuggestionClick,
  onDragStart,
  onDrag,
  onDragEnd,
  onAddBlock
}: BlockSuggestionsSidebarProps) {
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  // Start collapsed on mobile, expanded on desktop
  const [isCollapsed, setIsCollapsed] = useState(
    typeof window !== 'undefined' && window.innerWidth < 1024
  );

  // Check if a block type already exists
  const hasBlockType = (type: string) => {
    return existingBlocks.some(block => block.type === type);
  };

  return (
    <aside className={`relative border-r border-gray-200 bg-white transition-all duration-300 ${isCollapsed ? 'w-0' : 'w-80'}`}>
      {/* Collapse/Expand Button - positioned outside sidebar */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-4 lg:top-8 z-50 w-8 h-8 lg:w-6 lg:h-6 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center hover:bg-gray-50"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {/* Sidebar Content */}
      <div className={`h-full overflow-y-auto px-6 py-8 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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
      ) : (
        <>
          {/* Block Type Menu */}
          <div className="mb-6">
            <button
              onClick={() => setShowBlockMenu(!showBlockMenu)}
              className="w-full p-4 bg-[#75619D] hover:bg-[#624F8A] text-white rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Add a Block
            </button>

            <AnimatePresence>
              {showBlockMenu && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1 bg-white border border-gray-200 rounded-lg p-2 shadow-lg">
                    {BLOCK_TYPES.map((blockType, index) => {
                      const Icon = blockType.icon;
                      const isDisabled = (blockType.type === 'time' || blockType.type === 'location') && hasBlockType(blockType.type);
                      return (
                        <motion.button
                          key={blockType.type}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03, duration: 0.2 }}
                          onClick={() => {
                            if (!isDisabled) {
                              onAddBlock(blockType.type);
                              setShowBlockMenu(false);
                            }
                          }}
                          disabled={isDisabled}
                          className={`w-full p-3 text-left rounded-md transition-colors group ${
                            isDisabled
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDisabled ? 'text-gray-400' : 'text-[#75619D]'}`} />
                            <div>
                              <div className={`font-medium text-sm ${
                                isDisabled
                                  ? 'text-gray-400'
                                  : 'text-gray-900 group-hover:text-[#75619D]'
                              }`}>
                                {blockType.label}
                                {isDisabled && <span className="ml-2 text-xs">(Added)</span>}
                              </div>
                              <div className="text-xs text-gray-500">{blockType.description}</div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                Suggested for this event
              </p>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => onDragStart(e, suggestion)}
                  onDrag={onDrag}
                  onDragEnd={onDragEnd}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSuggestionClick(suggestion);
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
          )}
        </>
      )}
      </div>
    </aside>
  );
}
