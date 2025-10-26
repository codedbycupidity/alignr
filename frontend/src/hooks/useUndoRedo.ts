import { useRef, useCallback } from 'react';
import type { Block } from '../types/block';

interface HistoryState {
  blocks: Block[];
}

const MAX_HISTORY_SIZE = 50;

export function useUndoRedo() {
  const history = useRef<HistoryState[]>([]);
  const currentIndex = useRef<number>(-1);

  const saveState = useCallback((blocks: Block[]) => {
    // Remove any future history if we're not at the end
    history.current = history.current.slice(0, currentIndex.current + 1);

    // Add new state with deep copy to prevent mutations
    history.current.push({
      blocks: JSON.parse(JSON.stringify(blocks))
    });

    // Limit history size
    if (history.current.length > MAX_HISTORY_SIZE) {
      history.current.shift();
    } else {
      currentIndex.current++;
    }

    console.log('Saved undo state:', currentIndex.current, 'Total states:', history.current.length);
  }, []);

  const undo = useCallback(() => {
    if (currentIndex.current > 0) {
      currentIndex.current--;
      console.log('Undo to index:', currentIndex.current);
      return history.current[currentIndex.current].blocks;
    }
    console.log('Cannot undo - at beginning');
    return null;
  }, []);

  const redo = useCallback(() => {
    if (currentIndex.current < history.current.length - 1) {
      currentIndex.current++;
      console.log('Redo to index:', currentIndex.current);
      return history.current[currentIndex.current].blocks;
    }
    console.log('Cannot redo - at end');
    return null;
  }, []);

  const canUndo = () => currentIndex.current > 0;
  const canRedo = () => currentIndex.current < history.current.length - 1;

  return {
    undo,
    redo,
    canUndo: canUndo(),
    canRedo: canRedo(),
    saveState
  };
}
