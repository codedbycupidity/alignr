import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Block } from '../types/block';

export interface EventData {
  id: string;
  name: string;
  description?: string;
  eventType?: string;
  organizerId: string;
  organizerName: string;
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'draft' | 'active' | 'finalized';
}

export interface ParticipantData {
  id: string;
  name: string;
  email?: string;
  joinedAt: Timestamp;
  role: 'organizer' | 'participant';
}

// Create a new event
export async function createEvent(
  organizerId: string,
  organizerName: string,
  name: string,
  options?: {
    description?: string;
    eventType?: string;
    isPublic?: boolean;
  }
): Promise<string> {
  const eventRef = doc(collection(db, 'events'));
  const eventId = eventRef.id;

  const eventData: any = {
    name,
    organizerId,
    organizerName,
    isPublic: options?.isPublic ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: 'draft'
  };

  // Only add optional fields if they have values
  if (options?.description) {
    eventData.description = options.description;
  }

  if (options?.eventType) {
    eventData.eventType = options.eventType;
  }

  await setDoc(eventRef, eventData);

  // Add organizer as first participant
  const participantRef = doc(collection(eventRef, 'participants'), organizerId);
  await setDoc(participantRef, {
    id: organizerId,
    name: organizerName,
    joinedAt: serverTimestamp(),
    role: 'organizer'
  });

  return eventId;
}

// Get event by ID
export async function getEvent(eventId: string): Promise<EventData | null> {
  const eventRef = doc(db, 'events', eventId);
  const eventSnap = await getDoc(eventRef);

  if (!eventSnap.exists()) {
    return null;
  }

  return {
    id: eventSnap.id,
    ...eventSnap.data()
  } as EventData;
}

// Get all events for a user (as organizer or participant)
export async function getUserEvents(userId: string): Promise<EventData[]> {
  // Get events where user is organizer
  const organizerQuery = query(
    collection(db, 'events'),
    where('organizerId', '==', userId)
  );
  const organizerSnap = await getDocs(organizerQuery);

  const events: EventData[] = [];
  organizerSnap.forEach(doc => {
    events.push({
      id: doc.id,
      ...doc.data()
    } as EventData);
  });

  // TODO: Also get events where user is a participant
  // This requires a subcollection query or maintaining a user's event list

  return events;
}

// Update event details
export async function updateEvent(
  eventId: string,
  updates: Partial<Omit<EventData, 'id' | 'createdAt' | 'organizerId'>>
): Promise<void> {
  const eventRef = doc(db, 'events', eventId);
  await updateDoc(eventRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

// Delete event
export async function deleteEvent(eventId: string): Promise<void> {
  const eventRef = doc(db, 'events', eventId);

  // Delete all subcollections first (participants, blocks, etc.)
  const participantsRef = collection(eventRef, 'participants');
  const participantsSnap = await getDocs(participantsRef);
  const participantDeletes = participantsSnap.docs.map(doc => deleteDoc(doc.ref));

  const blocksRef = collection(eventRef, 'blocks');
  const blocksSnap = await getDocs(blocksRef);
  const blockDeletes = blocksSnap.docs.map(doc => deleteDoc(doc.ref));

  // Wait for all subcollection deletes
  await Promise.all([...participantDeletes, ...blockDeletes]);

  // Finally delete the event itself
  await deleteDoc(eventRef);
}

// Add participant to event
export async function addParticipant(
  eventId: string,
  participantName: string,
  userId?: string,
  password?: string
): Promise<string> {
  const eventRef = doc(db, 'events', eventId);
  const participantId = userId || `guest-${Date.now()}`;

  const participantRef = doc(collection(eventRef, 'participants'), participantId);
  const participantData: any = {
    id: participantId,
    name: participantName,
    joinedAt: serverTimestamp(),
    role: 'participant'
  };

  // Only add password if provided
  if (password) {
    participantData.password = password;
  }

  await setDoc(participantRef, participantData);

  return participantId;
}

// Get all participants for an event
export async function getParticipants(eventId: string): Promise<ParticipantData[]> {
  const eventRef = doc(db, 'events', eventId);
  const participantsSnap = await getDocs(collection(eventRef, 'participants'));

  const participants: ParticipantData[] = [];
  participantsSnap.forEach(doc => {
    participants.push(doc.data() as ParticipantData);
  });

  return participants;
}

// Check if participant name exists and get their data
export async function findParticipantByName(
  eventId: string,
  name: string
): Promise<(ParticipantData & { password?: string }) | null> {
  const eventRef = doc(db, 'events', eventId);
  const participantsSnap = await getDocs(collection(eventRef, 'participants'));

  let foundParticipant: (ParticipantData & { password?: string }) | null = null;

  participantsSnap.forEach(doc => {
    const data = doc.data();
    if (data.name === name) {
      foundParticipant = data as (ParticipantData & { password?: string });
    }
  });

  return foundParticipant;
}

// Verify participant password
export function verifyParticipantPassword(
  participant: { password?: string },
  providedPassword: string
): boolean {
  // If participant has no password, any password is invalid
  if (!participant.password) {
    return false;
  }
  // Simple string comparison (in production, use proper hashing)
  return participant.password === providedPassword;
}

// Add block to event
export async function addBlock(
  eventId: string,
  block: Omit<Block, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const eventRef = doc(db, 'events', eventId);
  const blockRef = doc(collection(eventRef, 'blocks'));
  const blockId = blockRef.id;

  await setDoc(blockRef, {
    ...block,
    id: blockId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return blockId;
}

// Update block
export async function updateBlock(
  eventId: string,
  blockId: string,
  updates: Partial<Block>
): Promise<void> {
  const blockRef = doc(db, 'events', eventId, 'blocks', blockId);
  await updateDoc(blockRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

// Get all blocks for an event
export async function getBlocks(eventId: string): Promise<Block[]> {
  const eventRef = doc(db, 'events', eventId);
  const blocksSnap = await getDocs(collection(eventRef, 'blocks'));

  const blocks: Block[] = [];
  blocksSnap.forEach(doc => {
    blocks.push(doc.data() as Block);
  });

  // Sort by order
  return blocks.sort((a, b) => a.order - b.order);
}

// Delete block
export async function deleteBlock(eventId: string, blockId: string): Promise<void> {
  const blockRef = doc(db, 'events', eventId, 'blocks', blockId);
  await deleteDoc(blockRef);
}

// Finalize event
export async function finalizeEvent(eventId: string): Promise<void> {
  const eventRef = doc(db, 'events', eventId);
  await updateDoc(eventRef, {
    status: 'finalized',
    finalizedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}
