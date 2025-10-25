import type { BlockType } from './block';

// ========================================
// GEMINI AI TYPES
// ========================================

export interface GeminiSuggestionRequest {
  eventName: string;
  eventType?: string;
  description?: string;
}

export interface AIEventSuggestion {
  blockType: BlockType;
  title: string;
  content: any;
  priority: number;
  reason?: string; // why Gemini suggested it
}

export interface EventType {
  type: string;
  keywords: string[];
  suggestedBlocks: AIEventSuggestion[];
}

// ========================================
// SNOWFLAKE AI TYPES
// ========================================

export interface SnowflakeInsightRequest {
  eventId: string;
  eventName: string;
  totalParticipants: number;
  totalVotes: number;
  winningTime?: string;
  winningLocation?: string;
  topContributor?: {
    name: string;
    suggestionsCount: number;
  };
}
