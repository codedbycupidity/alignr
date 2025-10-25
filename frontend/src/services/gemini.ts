import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';
import type { EventData } from './events';
import type { BlockType } from '../types/block';

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

    const data = result.data as { success: boolean; data?: BlockSuggestion[]; error?: string };

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
export async function suggestBlockContent(blockType: BlockType, eventName: string, participantCount?: number): Promise<unknown[]> {
  try {
    const suggestContentFn = httpsCallable(functions, 'suggestBlockContent');
    const result = await suggestContentFn({
      blockType,
      eventName,
      participantCount
    });

    const data = result.data as { success: boolean; data?: unknown[]; error?: string };

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to get content suggestions');
    }

    return data.data;
  } catch (error) {
    console.error('Error getting content suggestions:', error);
    return [];
  }
}

export interface TaskSuggestion {
  label: string;
  description: string;
}

/**
 * Call Gemini (via Firebase Functions) to suggest tasks for an event
 */
export async function suggestTasks(eventName: string, eventDescription?: string): Promise<TaskSuggestion[]> {
  try {
    const suggestTasksFn = httpsCallable(functions, 'suggestTasks');
    const result = await suggestTasksFn({
      eventName,
      eventDescription
    });

    const data = result.data as { success: boolean; data?: TaskSuggestion[]; error?: string };

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to get task suggestions');
    }

    return data.data;
  } catch (error) {
    console.error('Error getting task suggestions:', error);
    throw error;
  }
}

/**
 * Call Gemini (via Firebase Functions) to generate an event description
 */
export async function generateEventDescription(eventName: string): Promise<string> {
  try {
    const generateDescriptionFn = httpsCallable(functions, 'generateEventDescription');
    const result = await generateDescriptionFn({
      eventName
    });

    const data = result.data as { success: boolean; data?: string; error?: string };

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to generate event description');
    }

    return data.data;
  } catch (error) {
    console.error('Error generating event description:', error);
    throw error;
  }
}
