export interface Event {
  id: string;
  name: string;
  createdAt: Date;
  password?: string;
}

export interface Participant {
  id: string;
  eventId: string;
  name: string;
  availability: TimeSlot[];
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Block {
  id: string;
  eventId: string;
  type: 'time' | 'location' | 'task' | 'note';
  content: any;
  votes?: number;
}
