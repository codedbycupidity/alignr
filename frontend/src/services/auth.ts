import {
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  RecaptchaVerifier,
  ConfirmationResult,
  ApplicationVerifier,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { createUser, getUser } from './firestore';

// Setup reCAPTCHA verifier
export const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
  const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved, allow sign in
      console.log('reCAPTCHA verified');
    },
    'expired-callback': () => {
      // Response expired, ask user to solve reCAPTCHA again
      console.log('reCAPTCHA expired');
    }
  });
  return recaptchaVerifier;
};

// Send verification code to phone number
export const sendVerificationCode = async (
  phoneNumber: string,
  recaptchaVerifier: ApplicationVerifier
): Promise<ConfirmationResult> => {
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  return confirmationResult;
};

// Verify code and sign in
export const verifyCode = async (
  confirmationResult: ConfirmationResult,
  code: string,
  name?: string
): Promise<{ user: FirebaseUser; isNewUser: boolean }> => {
  const userCredential = await confirmationResult.confirm(code);
  const user = userCredential.user;
  const phoneNumber = user.phoneNumber || '';

  // Check if user already exists in Firestore
  const existingUser = await getUser(user.uid);
  const isNewUser = !existingUser || !existingUser.name;

  // Only create/update user document if new user with name
  if (isNewUser && name) {
    await createUser(user.uid, phoneNumber, name);
  } else if (!existingUser) {
    // Create user document without name for now (will be added later)
    await createUser(user.uid, phoneNumber);
  }

  return { user, isNewUser };
};

// Sign out
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// Listen to auth state changes
export const onAuthChange = (callback: (user: FirebaseUser | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
};
