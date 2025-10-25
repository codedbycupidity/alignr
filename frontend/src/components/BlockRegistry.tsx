import { 
  MessageSquare, 
  Check, 
  Users, 
  BarChart3, 
  Sparkles,
  LucideIcon
} from 'lucide-react';

// Import all block components
import NoteBlock from './NoteBlock';
import ChecklistBlock from './Checklist_Block';
import RsvpBlock from './RSVP_Block';
import VotingBlock from './Voting_Block';

export type BlockType = 'note' | 'checklist' | 'poll' | 'rsvp' | 'gemmi';

export interface Block {
  id: number;
  type: BlockType;
  x: number;
  y: number;
  content?: string;
  items?: string[];
  options?: { text: string; votes: number; voters: string[] }[];
  people?: string[];
  editableByAll?: boolean;
}

export interface BlockConfig {
  type: BlockType;
  label: string;
  icon: LucideIcon;
  component: React.ComponentType<any>;
  defaultData: {
    content?: string;
    items?: string[];
    options?: { text: string; votes: number; voters: string[] }[];
    people?: string[];
  };
}

// Registry of all available blocks
export const BLOCK_REGISTRY: Record<BlockType, BlockConfig> = {
  note: {
    type: 'note',
    label: 'Text Note',
    icon: MessageSquare,
    component: NoteBlock,
    defaultData: {
      content: 'New note...'
    }
  },
  checklist: {
    type: 'checklist',
    label: 'Checklist',
    icon: Check,
    component: ChecklistBlock,
    defaultData: {
      items: ['New task']
    }
  },
  poll: {
    type: 'poll',
    label: 'Time Voting',
    icon: BarChart3,
    component: VotingBlock,
    defaultData: {
      options: [{ text: 'Option 1', votes: 0, voters: [] }]
    }
  },
  rsvp: {
    type: 'rsvp',
    label: 'RSVP List',
    icon: Users,
    component: RsvpBlock,
    defaultData: {
      people: []
    }
  },
  gemmi: {
    type: 'gemmi',
    label: 'Gemini Insight',
    icon: Sparkles,
    component: () => null, // Placeholder for now
    defaultData: {
      content: 'AI insight will appear here'
    }
  }
};

// Helper to get all block types
export const getBlockTypes = (): BlockType[] => {
  return Object.keys(BLOCK_REGISTRY) as BlockType[];
};

// Helper to get block config
export const getBlockConfig = (type: BlockType): BlockConfig => {
  return BLOCK_REGISTRY[type];
};

// Helper to create new block
export const createBlock = (type: BlockType, editableByAll: boolean = false) => {
  const config = getBlockConfig(type);
  return {
    id: Date.now(),
    type,
    x: 150,
    y: 150,
    ...config.defaultData,
    editableByAll
  };
};
