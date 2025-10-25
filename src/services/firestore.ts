import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  addDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { User, Event, Participant, Block, EventAnalytics } from '../types';

// ========================================
// USERS COLLECTION
// ========================================

export const createUser = async (userId: string, email: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    email,
    createdAt: Timestamp.now(),
    eventIds: [],
  });
};

export const getUser = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() } as User;
  }
  return null;
};

export const addEventToUser = async (userId: string, eventId: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const currentEventIds = userSnap.data().eventIds || [];
    await updateDoc(userRef, {
      eventIds: [...currentEventIds, eventId],
    });
  }
};

// ========================================
// EVENTS COLLECTION
// ========================================

export const createEvent = async (
  name: string,
  organizerId: string,
  isPublic: boolean = true
): Promise<string> => {
  const eventRef = await addDoc(collection(db, 'events'), {
    name,
    createdAt: Timestamp.now(),
    organizerId,
    isPublic,
    isFinalized: false,
  });

  // Add event ID to user's eventIds
  await addEventToUser(organizerId, eventRef.id);

  return eventRef.id;
};

export const getEvent = async (eventId: string): Promise<Event | null> => {
  const eventRef = doc(db, 'events', eventId);
  const eventSnap = await getDoc(eventRef);

  if (eventSnap.exists()) {
    return { id: eventSnap.id, ...eventSnap.data() } as Event;
  }
  return null;
};

export const updateEvent = async (eventId: string, data: Partial<Event>): Promise<void> => {
  const eventRef = doc(db, 'events', eventId);
  await updateDoc(eventRef, data);
};

export const finalizeEvent = async (eventId: string): Promise<void> => {
  const eventRef = doc(db, 'events', eventId);
  await updateDoc(eventRef, {
    isFinalized: true,
    finalizedAt: Timestamp.now(),
  });
};

export const getUserEvents = async (userId: string): Promise<Event[]> => {
  const q = query(
    collection(db, 'events'),
    where('organizerId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
};

// ========================================
// PARTICIPANTS SUBCOLLECTION
// ========================================

export const addParticipant = async (
  eventId: string,
  displayName: string,
  isOrganizer: boolean = false
): Promise<string> => {
  const participantRef = await addDoc(collection(db, 'events', eventId, 'participants'), {
    displayName,
    joinedAt: Timestamp.now(),
    isOrganizer,
    activityScore: 0,
  });

  return participantRef.id;
};

export const getParticipants = async (eventId: string): Promise<Participant[]> => {
  const participantsRef = collection(db, 'events', eventId, 'participants');
  const querySnapshot = await getDocs(participantsRef);

  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Participant));
};

export const updateParticipantActivity = async (
  eventId: string,
  participantId: string,
  increment: number = 1
): Promise<void> => {
  const participantRef = doc(db, 'events', eventId, 'participants', participantId);
  const participantSnap = await getDoc(participantRef);

  if (participantSnap.exists()) {
    const currentScore = participantSnap.data().activityScore || 0;
    await updateDoc(participantRef, {
      activityScore: currentScore + increment,
    });
  }
};

// ========================================
// BLOCKS SUBCOLLECTION
// ========================================

export const createBlock = async (
  eventId: string,
  block: Omit<Block, 'id' | 'createdAt'>
): Promise<string> => {
  const blockRef = await addDoc(collection(db, 'events', eventId, 'blocks'), {
    ...block,
    createdAt: Timestamp.now(),
  });

  return blockRef.id;
};

export const getBlocks = async (eventId: string): Promise<Block[]> => {
  const blocksRef = collection(db, 'events', eventId, 'blocks');
  const q = query(blocksRef, orderBy('createdAt', 'asc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Block));
};

export const updateBlock = async (
  eventId: string,
  blockId: string,
  data: Partial<Block>
): Promise<void> => {
  const blockRef = doc(db, 'events', eventId, 'blocks', blockId);
  await updateDoc(blockRef, data);
};

export const deleteBlock = async (eventId: string, blockId: string): Promise<void> => {
  const blockRef = doc(db, 'events', eventId, 'blocks', blockId);
  await deleteDoc(blockRef);
};

// ========================================
// ANALYTICS SUBCOLLECTION
// ========================================

export const saveEventAnalytics = async (
  eventId: string,
  analytics: EventAnalytics
): Promise<void> => {
  const analyticsRef = doc(db, 'events', eventId, 'analytics', 'summary');
  await setDoc(analyticsRef, {
    ...analytics,
    generatedAt: Timestamp.now(),
  });
};

export const getEventAnalytics = async (eventId: string): Promise<EventAnalytics | null> => {
  const analyticsRef = doc(db, 'events', eventId, 'analytics', 'summary');
  const analyticsSnap = await getDoc(analyticsRef);

  if (analyticsSnap.exists()) {
    return analyticsSnap.data() as EventAnalytics;
  }
  return null;
};

// ========================================
// REAL-TIME LISTENERS
// ========================================

export const subscribeToEvent = (
  eventId: string,
  callback: (event: Event) => void
): (() => void) => {
  const eventRef = doc(db, 'events', eventId);
  return onSnapshot(eventRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as Event);
    }
  });
};

export const subscribeToBlocks = (
  eventId: string,
  callback: (blocks: Block[]) => void
): (() => void) => {
  const blocksRef = collection(db, 'events', eventId, 'blocks');
  const q = query(blocksRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const blocks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Block));
    callback(blocks);
  });
};

export const subscribeToParticipants = (
  eventId: string,
  callback: (participants: Participant[]) => void
): (() => void) => {
  const participantsRef = collection(db, 'events', eventId, 'participants');

  return onSnapshot(participantsRef, (snapshot) => {
    const participants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Participant));
    callback(participants);
  });
};
