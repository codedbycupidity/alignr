import { Timestamp } from 'firebase/firestore';
import type { Participant } from './participant';
import type { Block } from './block';
import type { EventAnalytics } from './analytics';

export interface Event {
  id: string;
  name: string;
  createdAt: Timestamp;
  organizerId: string;
  isPublic: boolean;
  isFinalized: boolean;
  finalizedAt?: Timestamp;
}

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
