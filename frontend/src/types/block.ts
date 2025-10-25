import { Timestamp } from 'firebase/firestore';

// ========================================
// BLOCK BASE TYPES
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

// ========================================
// TIME BLOCK
// ========================================

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

// ========================================
// LOCATION BLOCK
// ========================================

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

// ========================================
// TASK BLOCK
// ========================================

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

// ========================================
// NOTE BLOCK
// ========================================

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
