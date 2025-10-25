import { Timestamp } from 'firebase/firestore';

export interface Participant {
  id: string;
  displayName: string;
  joinedAt: Timestamp;
  isOrganizer: boolean;
  activityScore: number;
}
