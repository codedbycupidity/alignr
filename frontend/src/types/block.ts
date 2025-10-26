import { Timestamp } from 'firebase/firestore';

// ========================================
// BLOCK BASE TYPES
// ========================================

export type BlockType = 'time' | 'location' | 'task' | 'note' | 'budget' | 'rsvp' | 'album';

export interface BlockLayout {
  x: number; // Grid column position (0-11)
  y: number; // Grid row position
  w: number; // Width in grid units (1-12)
  h: number; // Height in grid units
}

export interface Block {
  id: string;
  type: BlockType;
  title?: string;
  content: TimeBlockContent | LocationBlockContent | TaskBlockContent | NoteBlockContent | BudgetBlockContent | RSVPBlockContent | AlbumBlockContent;
  order: number;
  author: string;
  layout: BlockLayout; // Position and size on canvas
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// ========================================
// TIME BLOCK
// ========================================

export interface TimeSlot {
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format (24-hour)
  endTime: string; // HH:MM format (24-hour)
  available: boolean;
}

export interface ParticipantAvailability {
  participantId: string;
  participantName: string;
  timeSlots: TimeSlot[];
  submittedAt: Timestamp;
}

export interface TimeBlockContent {
  mode: 'availability' | 'voting' | 'fixed'; // availability = When2Meet style, voting = simple poll, fixed = organizer sets date/time

  // For availability mode
  dateType?: 'specific' | 'days';
  selectedDates?: string[]; // YYYY-MM-DD format
  selectedDays?: number[]; // 0-6 for Sunday-Saturday
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  timezone?: string;
  intervalMinutes?: number; // 15, 30, 60
  availability?: ParticipantAvailability[]; // Stored directly in block

  // For voting mode
  options?: TimeOption[];

  // For fixed mode
  fixedDate?: string; // YYYY-MM-DD format
  fixedStartTime?: string; // HH:MM
  fixedEndTime?: string; // HH:MM
  fixedTimezone?: string;
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
  allowParticipantSuggestions?: boolean;
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
  likes?: string[]; // Array of user IDs who liked the note
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
// BUDGET BLOCK
// ========================================

export interface BudgetBlockContent {
  responses: BudgetResponse[];
  showResponsesToParticipants?: boolean;
}

export interface BudgetResponse {
  participantId: string;
  participantName: string;
  budgetLevel: number; // 1-5 dollar signs
  submittedAt: Timestamp;
}

export interface BudgetBlock extends Block {
  type: 'budget';
  content: BudgetBlockContent;
}

// ========================================
// RSVP BLOCK
// ========================================

export interface RSVPBlockContent {
  // Empty for now - participants are automatically fetched from the event
}

export interface RSVPBlock extends Block {
  type: 'rsvp';
  content: RSVPBlockContent;
}

// ========================================
// ALBUM BLOCK (Shared Album)
// ========================================

export interface ImageItem {
  id: string;
  url: string;
  title?: string;
  uploadedBy?: string;
  uploadedAt: string; // ISO
}

export interface AlbumBlockContent {
  images: ImageItem[];
  allowParticipantUploads: boolean;
}

export interface AlbumBlock extends Block {
  type: 'album';
  content: AlbumBlockContent;
}
