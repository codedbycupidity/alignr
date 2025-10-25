import { Timestamp } from 'firebase/firestore';

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
