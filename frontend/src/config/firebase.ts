import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Authentication
export const auth = getAuth(app);

// Debug: log which Firebase project the app is using (non-secret) and auth state changes
try {
  // eslint-disable-next-line no-console
  console.debug('[firebase] projectId:', firebaseConfig.projectId);
} catch (e) {}

// Log auth state changes to help diagnose permission issues
try {
  auth.onAuthStateChanged((user) => {
    // eslint-disable-next-line no-console
    console.debug('[firebase] auth state changed. userId:', user ? user.uid : null);
  });
} catch (e) {}

// Initialize Functions
export const functions = getFunctions(app);

// Initialize Storage
export const storage = getStorage(app);
