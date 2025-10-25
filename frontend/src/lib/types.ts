export interface User{
  uid: string;
  email: string;
  createdAt: Date;
  eventIds: string[];
}
export interface Participant{
  id: string;
  displayName: string;
  joinedAt: Date;
  isOrganizer: boolean;
  suggestionsCount: number;
}

export interface BlockVote{
  participantId: string;
  optionIndex: number;
  timestamp: Date;
}

export interface Block{
  id: string;
  eventId: string;
  type: 'time' | 'location'|'task'| 'note';
  title: string;
  content: any; //varies by type of event the user creates
  votes: Record<string, number>; //includes a vte count
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeBlock extends Block{
  type: 'time';
  content: {
    options: {
      label: string;
      timestamp: string;
      votes: number;
    }[];
  };
}

export interface LocationBlock extends Block{
  type: 'location';
  content: {
    options: {
      label: string;
      mapLink?: string;
      votes: number;
    }[];
  };
}

//a task block for if the host wants to know what everyone is bringing
export interface TaskBlock extends Block {
  type: 'task';
  content: {
    tasks: {
      id: string;
      label: string;
      claimedBy?: string;
      completed: boolean;
    }[];
  };
}

export interface NoteBlock extends Block{
  type: 'note';
  content: {
    text: string;
    lastEditedBy: string;
  };
}

export interface Plan{
  id: string;
  name: string;
  createdAt: Date;
  organizerId: string;
  isPublic: boolean;
  isFinalized: boolean;
  finalizedAt?: Date;
  participants: Participant[];
  blocks: Block[];
  analytics?: EventAnalytics;
}
export interface EventAnalytics{
  totalParticipants: number;
  totalVotes: number;
  topTime: string;
  topLocation: string;
  mvp:{
    name: string;
    suggestionsCount: number;
  };
  snowflakeInsight: string;
  generatedAt: Date;
}

export interface AIEventSuggestion{
  blockType: 'time' | 'location' | 'task' | 'note';
  title: string;
  content: any;
  reason: string; //why Gemini suggested it
}

export interface EventType {
  type: string;
  keywords: string[];
  suggestedBlocks: AIEventSuggestion[];
}

//Auth context types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

//API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}