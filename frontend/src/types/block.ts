import { Timestamp } from 'firebase/firestore';

// ========================================
// BLOCK BASE TYPES
// ========================================

export type BlockType = 'time' | 'location' | 'task' | 'note' | 'budget' | 'image' | 'poll' | 'rsvp';

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
  content:
    | TimeBlockContent
    | LocationBlockContent
    | TaskBlockContent
    | NoteBlockContent
    | BudgetBlockContent
    | ImageBlockContent
    | PollBlockContent
    | RsvpBlockContent;
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
// IMAGE BLOCK
// ========================================

export interface ImageBlockContent {
  images: ImageItem[];
  allowParticipantUploads: boolean;
}

export interface ImageItem {
  id: string;
  url: string;
  storageRef: string;
  title?: string;
  uploadedBy: string;
  uploadedAt: Timestamp | string;
}

export interface ImageBlock extends Block {
  type: 'image';
  content: ImageBlockContent;
}

// ========================================
// POLL BLOCK
// ========================================

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[]; // Array of voter names
}

export interface PollBlockContent {
  title: string;
  allowMultipleVotes: boolean;
  options: PollOption[];
  totalVotes: number;
}

export interface PollBlock extends Block {
  type: 'poll';
  content: PollBlockContent;
}

// ========================================
// RSVP BLOCK
// ========================================

export interface RsvpResponse {
  name: string;
  response: 'going' | 'not-going' | 'maybe';
  timestamp: Timestamp;
}

export interface RsvpBlockContent {
  responses: RsvpResponse[];
  allowMaybe: boolean;
  deadline?: Timestamp;
}

export interface RsvpBlock extends Block {
  type: 'rsvp';
  content: RsvpBlockContent;
}

// ========================================
// POLL BLOCK
// ========================================

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[]; // Array of voter names
}

export interface PollBlockContent {
  title: string;
  allowMultipleVotes: boolean;
  options: PollOption[];
  totalVotes: number;
}

export interface PollBlock extends Block {
  type: 'poll';
  content: PollBlockContent;
}

// ========================================
// RSVP BLOCK
// ========================================

export interface RsvpResponse {
  name: string;
  response: 'going' | 'not-going' | 'maybe';
  timestamp: Timestamp;
}

export interface RsvpBlockContent {
  responses: RsvpResponse[];
  allowMaybe: boolean;
  deadline?: Timestamp;
}

export interface RsvpBlock extends Block {
  type: 'rsvp';
  content: RsvpBlockContent;
}
