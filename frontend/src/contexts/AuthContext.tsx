import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User as AppUser } from '../types/user';
import { signOut, onAuthChange, setupRecaptcha, sendVerificationCode, verifyCode } from '../services/auth';
import type { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  recaptchaVerifier: RecaptchaVerifier | null;
  confirmationResult: ConfirmationResult | null;
  sendCode: (phoneNumber: string) => Promise<void>;
  confirmCode: (code: string, name?: string) => Promise<{ isNewUser: boolean }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      if (u) {
        setUser({
          id: u.uid,
          email: u.phoneNumber ?? '',
          createdAt: (u as any).metadata?.createdAt ?? null,
          eventIds: []
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const sendCode = async (phoneNumber: string) => {
    try {
      // Clear any existing reCAPTCHA
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }

      // Setup new reCAPTCHA verifier
      const verifier = setupRecaptcha('recaptcha-container');
      setRecaptchaVerifier(verifier);

      // Send verification code
      const result = await sendVerificationCode(phoneNumber, verifier);
      setConfirmationResult(result);
    } catch (error: any) {
      // Clear reCAPTCHA on error
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        setRecaptchaVerifier(null);
      }
      throw error;
    }
  };

  const confirmCode = async (code: string, name?: string) => {
    if (!confirmationResult) {
      throw new Error('No confirmation result available');
    }
    const result = await verifyCode(confirmationResult, code, name);
    setConfirmationResult(null);
    return { isNewUser: result.isNewUser };
  };

  const logout = async () => {
    await signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, recaptchaVerifier, confirmationResult, sendCode, confirmCode, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
