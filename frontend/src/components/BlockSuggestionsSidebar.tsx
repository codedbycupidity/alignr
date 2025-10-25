import { Sparkles, Loader2, Plus, Clock, MapPin, CheckSquare, FileText, BarChart3, Users, DollarSign } from 'lucide-react';
import { useState } from 'react';
import type { BlockSuggestion } from '../services/gemini';
import type { Block } from '../types/block';

const BLOCK_TYPES = [
  { type: 'time', label: 'Time', icon: Clock, description: 'Schedule & availability' },
  { type: 'location', label: 'Location', icon: MapPin, description: 'Venue suggestions' },
  { type: 'task', label: 'Task', icon: CheckSquare, description: 'To-do lists' },
  { type: 'note', label: 'Note', icon: FileText, description: 'General notes' },
  { type: 'poll', label: 'Poll', icon: BarChart3, description: 'Quick decisions' },
  { type: 'rsvp', label: 'RSVP', icon: Users, description: 'Track attendance' },
  { type: 'budget', label: 'Budget', icon: DollarSign, description: 'Split expenses' },
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

  // Check if a block type already exists
  const hasBlockType = (type: string) => {
    return existingBlocks.some(block => block.type === type);
  };

  return (
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

            {showBlockMenu && (
              <div className="mt-2 space-y-1 bg-white border border-gray-200 rounded-lg p-2 shadow-lg">
                {BLOCK_TYPES.map((blockType) => {
                  const Icon = blockType.icon;
                  const isDisabled = (blockType.type === 'time' || blockType.type === 'location') && hasBlockType(blockType.type);
                  return (
                    <button
                      key={blockType.type}
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
                    </button>
                  );
                })}
              </div>
            )}
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
    </aside>
  );
}
