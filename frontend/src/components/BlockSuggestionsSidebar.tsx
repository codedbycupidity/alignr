import { Sparkles, Loader2, Plus } from 'lucide-react';
import type { BlockSuggestion } from '../services/gemini';

interface BlockSuggestionsSidebarProps {
  loadingSuggestions: boolean;
  suggestions: BlockSuggestion[];
  onSuggestionClick: (suggestion: BlockSuggestion) => void;
  onDragStart: (e: React.DragEvent, suggestion: BlockSuggestion) => void;
  onDrag: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onAddBlock: () => void;
}

export default function BlockSuggestionsSidebar({
  loadingSuggestions,
  suggestions,
  onSuggestionClick,
  onDragStart,
  onDrag,
  onDragEnd,
  onAddBlock
}: BlockSuggestionsSidebarProps) {
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
      ) : suggestions.length > 0 ? (
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
      ) : (
        <div className="text-center py-8">
          <button
            onClick={onAddBlock}
            className="w-full p-4 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-[#75619D] rounded-lg transition-all"
          >
            <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Add a Block</p>
            <p className="text-xs text-gray-500 mt-1">Start building your event</p>
          </button>
        </div>
      )}
    </aside>
  );
}
