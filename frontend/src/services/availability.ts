import { collection, doc, setDoc, getDocs, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { TimeSlot, ParticipantAvailability } from '../types/availability';

// Save participant availability
export async function saveParticipantAvailability(
  eventId: string,
  participantId: string,
  participantName: string,
  timeSlots: TimeSlot[]
): Promise<void> {
  const availabilityRef = doc(db, 'events', eventId, 'availability', participantId);

  await setDoc(availabilityRef, {
    participantId,
    participantName,
    timeSlots,
    submittedAt: serverTimestamp()
  });
}

// Get all availability for an event
export async function getEventAvailability(eventId: string): Promise<ParticipantAvailability[]> {
  const availabilityRef = collection(db, 'events', eventId, 'availability');
  const snapshot = await getDocs(availabilityRef);

  const availability: ParticipantAvailability[] = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    availability.push({
      participantId: data.participantId,
      participantName: data.participantName,
      timeSlots: data.timeSlots,
      submittedAt: data.submittedAt?.toDate() || new Date()
    });
  });

  return availability;
}

// Get availability for a specific participant
export async function getParticipantAvailability(
  eventId: string,
  participantId: string
): Promise<TimeSlot[]> {
  const availabilityRef = doc(db, 'events', eventId, 'availability', participantId);
  const snapshot = await getDoc(availabilityRef);

  if (!snapshot.exists()) {
    return [];
  }

  const data = snapshot.data();
  return data.timeSlots || [];
}

// Generate time slots for the grid based on event settings
export function generateTimeSlots(
  dates: string[],
  startTime: string,
  endTime: string,
  intervalMinutes: number = 30
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  for (const date of dates) {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes < endMinutes) {
      const nextMinutes = Math.min(currentMinutes + intervalMinutes, endMinutes);

      const startH = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
      const startM = (currentMinutes % 60).toString().padStart(2, '0');
      const endH = Math.floor(nextMinutes / 60).toString().padStart(2, '0');
      const endM = (nextMinutes % 60).toString().padStart(2, '0');

      slots.push({
        date,
        startTime: `${startH}:${startM}`,
        endTime: `${endH}:${endM}`,
        available: false
      });

      currentMinutes = nextMinutes;
    }
  }

  return slots;
}
