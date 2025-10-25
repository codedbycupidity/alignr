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
  submittedAt: Date;
}

export interface AvailabilityGrid {
  dates: string[]; // Array of dates in YYYY-MM-DD format
  timeRange: {
    start: string; // HH:MM
    end: string; // HH:MM
  };
  interval: number; // minutes (e.g., 15, 30, 60)
}
