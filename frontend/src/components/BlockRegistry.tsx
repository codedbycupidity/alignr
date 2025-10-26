import { 
  MessageSquare, 
  Check, 
  Users, 
  BarChart3, 
  Sparkles,
  Image,
  LucideIcon
} from 'lucide-react';

// Import all block components
import NoteBlock from './NoteBlock';
import ChecklistBlock from './Checklist_Block';
import RsvpBlock from './RSVP_Block';
import VotingBlock from './Voting_Block';
import ImageBlock from './ImageBlock';

// Import shared types
import { Block, BlockType, PollOption, PollBlockContent, RsvpResponse, RsvpBlockContent } from '../types/block';

export interface BlockConfig {
  type: BlockType;
  label: string;
  icon: LucideIcon;
  component: React.ComponentType<any>;
  defaultData: {
    title?: string;
  } & BlockContent;
}

import React from 'react';

export interface BlockConfig {
  type: BlockType;
  label: string;
  icon: LucideIcon;
  component: React.ComponentType<any>;
  defaultData: {
    title: string;
    type: BlockType;
    content: any;
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
      title: 'Notes',
      type: 'note',
      content: {
        text: 'New note...',
        comments: []
      }
    }
  },
  task: {
    type: 'task',
    label: 'Tasks',
    icon: Check,
    component: ChecklistBlock,
    defaultData: {
      title: 'Tasks',
      type: 'task',
      content: {
        tasks: []
      }
    }
  },
  poll: {
    type: 'poll',
    label: 'Poll',
    icon: BarChart3,
    component: VotingBlock,
    defaultData: {
      title: 'Quick Poll',
      type: 'poll',
      content: {
        title: 'Quick Poll',
        allowMultipleVotes: false,
        options: [{ 
          id: `option-${Date.now()}`, 
          text: 'Option 1', 
          votes: 0, 
          voters: [] 
        }],
        totalVotes: 0
      }
    }
  },
  rsvp: {
    type: 'rsvp',
    label: 'RSVP',
    icon: Users,
    component: RsvpBlock,
    defaultData: {
      title: 'RSVP',
      type: 'rsvp',
      content: {
        responses: [],
        allowMaybe: true
      }
    }
  },
  image: {
    type: 'image',
    label: 'Images',
    icon: Image,
    component: ImageBlock,
    defaultData: {
      title: 'Photo Gallery',
      type: 'image',
      content: {
        images: [],
        allowParticipantUploads: true
      }
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
  const { defaultData } = config;
  return {
    id: Date.now(),
    type,
    x: 150,
    y: 150,
    title: defaultData.title || config.label,
    ...defaultData,
    editableByAll
  };
};
