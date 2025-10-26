import { useState } from 'react';
import { suggestBlocks, type BlockSuggestion } from '../services/gemini';
import type { EventData } from '../services/events';

export function useBlockSuggestions() {
  const [suggestions, setSuggestions] = useState<BlockSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [draggingSuggestion, setDraggingSuggestion] = useState<BlockSuggestion | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDragStart = (e: React.DragEvent, suggestion: BlockSuggestion) => {
    setDraggingSuggestion(suggestion);
    setIsDragging(true);
    setDragPosition({ x: e.clientX, y: e.clientY });

    // Make drag image invisible
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDrag = (e: React.DragEvent) => {
    if (e.clientX === 0 && e.clientY === 0) return;
    setDragPosition({ x: e.clientX, y: e.clientY });
  };

  const handleDragEnd = () => {
    setDraggingSuggestion(null);
    setIsDragging(false);
  };

  return {
    suggestions,
    loadingSuggestions,
    draggingSuggestion,
    dragPosition,
    isDragging,
    loadSuggestions,
    handleDragStart,
    handleDrag,
    handleDragEnd
  };
}
