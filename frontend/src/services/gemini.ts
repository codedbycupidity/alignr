import { getFunctions, httpsCallable } from 'firebase/functions';
import type { EventData } from './events';
import type { BlockType } from '../types/block';

const functions = getFunctions();

export interface BlockSuggestion {
  blockType: BlockType;
  title: string;
  reason: string;
  priority: number; // 1-5, where 1 is most important
}

/**
 * Call Gemini (via Firebase Functions) to suggest blocks for an event
 */
export async function suggestBlocks(event: EventData): Promise<BlockSuggestion[]> {
  try {
    const suggestBlocksFn = httpsCallable(functions, 'suggestBlocks');
    const result = await suggestBlocksFn({
      eventName: event.name,
      eventType: event.eventType,
      description: event.description
    });

    const data = result.data as { success: boolean; data?: any[]; error?: string };

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to get block suggestions');
    }

    return data.data;
  } catch (error) {
    console.error('Error getting block suggestions:', error);
    // Fallback: always suggest at least time block
    return [
      {
        blockType: 'time',
        title: 'Find the Best Time',
        reason: 'Help participants find a time that works for everyone',
        priority: 1
      }
    ];
  }
}

/**
 * Call Gemini (via Firebase Functions) to suggest content for a specific block type
 */
export async function suggestBlockContent(blockType: BlockType, eventName: string, participantCount?: number): Promise<any[]> {
  try {
    const suggestContentFn = httpsCallable(functions, 'suggestBlockContent');
    const result = await suggestContentFn({
      blockType,
      eventName,
      participantCount
    });

    const data = result.data as { success: boolean; data?: any[]; error?: string };

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to get content suggestions');
    }

    return data.data;
  } catch (error) {
    console.error('Error getting content suggestions:', error);
    return [];
  }
}
