import { Timestamp } from 'firebase/firestore';

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
