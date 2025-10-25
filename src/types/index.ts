import { Timestamp } from 'firebase/firestore';

// ========================================
// USER & AUTH TYPES
// ========================================

export interface User {
  id: string;
  email: string;
  createdAt: Timestamp;
  eventIds: string[];
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ========================================
// EVENT & PARTICIPANT TYPES
// ========================================

export interface Event {
  id: string;
  name: string;
  createdAt: Timestamp;
  organizerId: string;
  isPublic: boolean;
  isFinalized: boolean;
  finalizedAt?: Timestamp;
}

export interface Participant {
  id: string;
  displayName: string;
  joinedAt: Timestamp;
  isOrganizer: boolean;
  activityScore: number;
}

// ========================================
// BLOCK TYPES
// ========================================

export type BlockType = 'time' | 'location' | 'task' | 'note';

export interface Block {
  id: string;
  type: BlockType;
  title?: string;
  content: TimeBlockContent | LocationBlockContent | TaskBlockContent | NoteBlockContent;
  votes: number;
  author: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Time Block
export interface TimeBlockContent {
  options: TimeOption[];
}

export interface TimeOption {
  id: string;
  label: string;
  date: string;
  startTime: string;
  endTime: string;
  votes: string[]; // participant IDs who voted
}

export interface TimeBlock extends Block {
  type: 'time';
  content: TimeBlockContent;
}

// Location Block
export interface LocationBlockContent {
  options: LocationOption[];
}

export interface LocationOption {
  id: string;
  label: string;
  name: string;
  address?: string;
  mapsLink?: string;
  votes: string[]; // participant IDs who voted
}

export interface LocationBlock extends Block {
  type: 'location';
  content: LocationBlockContent;
}

// Task Block
export interface TaskBlockContent {
  tasks: Task[];
}

export interface Task {
  id: string;
  label: string;
  description: string;
  claimedBy?: string; // participant ID or name
  completed: boolean;
}

export interface TaskBlock extends Block {
  type: 'task';
  content: TaskBlockContent;
}

// Note Block
export interface NoteBlockContent {
  text: string;
  lastEditedBy?: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: Timestamp;
}

export interface NoteBlock extends Block {
  type: 'note';
  content: NoteBlockContent;
}

// ========================================
// ANALYTICS TYPES
// ========================================

export interface EventAnalytics {
  totalParticipants: number;
  totalVotes: number;
  totalSuggestions: number;
  engagementRate: number;
  topTime?: string;
  topLocation?: string;
  mvp?: {
    name: string;
    suggestionsCount: number;
  };
  snowflakeInsight?: string;
  generatedAt?: Timestamp;
}

// ========================================
// AI & API TYPES
// ========================================

// Gemini AI Suggestions
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

// Snowflake Insights
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

// Generic API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ========================================
// PLAN (COMPLETE EVENT VIEW)
// ========================================

export interface Plan {
  id: string;
  name: string;
  createdAt: Timestamp;
  organizerId: string;
  isPublic: boolean;
  isFinalized: boolean;
  finalizedAt?: Timestamp;
  participants: Participant[];
  blocks: Block[];
  analytics?: EventAnalytics;
}
