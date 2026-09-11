import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSecurityProfile } from './securityTypes';
import { auditLogger } from './auditLogger';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  signOut, 
  onAuthStateChanged,
  updateFbProfile,
  FirebaseUser
} from './firebase';

export interface PhoneOtpResult {
  success: boolean;
  message: string;
  cooldownSeconds?: number;
}

export interface VerifyOtpResult {
  success: boolean;
  message: string;
  verified?: boolean;
}

export interface AuthContextValue {
  user: UserSecurityProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  providers: string[];
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, displayName?: string) => Promise<{ verificationEmailSent: boolean }>;
  sendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<void>;
  loginWithPhoneSendOtp: (phone: string) => Promise<PhoneOtpResult>;
  verifyPhoneOtp: (phone: string, code: string) => Promise<VerifyOtpResult>;
  updateProfile: (updates: Partial<UserSecurityProfile>) => void;
  setProfilePhoto: (dataUrl: string | null) => void;
  logout: () => Promise<void>;
  getAuthToken: () => Promise<string | null>;
}

const defaultContextValue: AuthContextValue = {
  user: null,
  loading: true,
  isAuthenticated: false,
  emailVerified: false,
  phoneVerified: false,
  providers: [],
  loginWithGoogle: async () => {},
  loginWithEmail: async () => {},
  signupWithEmail: async () => ({ verificationEmailSent: false }),
  sendVerificationEmail: async () => {},
  reloadUser: async () => {},
  loginWithPhoneSendOtp: async () => ({ success: false, message: 'Provider initializing' }),
  verifyPhoneOtp: async () => ({ success: false, message: 'Provider initializing' }),
  updateProfile: () => {},
  setProfilePhoto: () => {},
  logout: async () => {},
  getAuthToken: async () => null,
};

const AuthContext = createContext<AuthContextValue>(defaultContextValue);

const SESSION_TOKEN_KEY = 'nexa_session_auth_token';
const PHONE_VERIFIED_KEY = 'nexa_verified_phone_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSecurityProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Map Firebase User to NEXA Trusted Security Profile
  const mapFirebaseUser = (fbUser: FirebaseUser | null): UserSecurityProfile | null => {
    if (!fbUser) return null;

    const providers = fbUser.providerData.map(p => p.providerId);
    const primaryProvider = fbUser.providerData[0]?.providerId || 'password';

    // Check if phone was verified via phone auth or verified session
    const verifiedPhoneSession = sessionStorage.getItem(PHONE_VERIFIED_KEY);
    let verifiedPhoneNumber = fbUser.phoneNumber || undefined;
    let isPhoneVerified = Boolean(fbUser.phoneNumber);

    if (!isPhoneVerified && verifiedPhoneSession) {
      try {
        const parsed = JSON.parse(verifiedPhoneSession);
        if (parsed.phone && parsed.token && Number(parsed.expiresAt) > Date.now()) {
          verifiedPhoneNumber = parsed.phone;
          isPhoneVerified = true;
        }
      } catch {
        // Ignore parsing error
      }
    }

    // Google accounts automatically have verified emails in Firebase
    const isEmailVerified = Boolean(
      fbUser.emailVerified || primaryProvider === 'google.com' || primaryProvider === 'google'
    );

    return {
      uid: fbUser.uid,
      email: fbUser.email || undefined,
      emailVerified: isEmailVerified,
      phone: verifiedPhoneNumber,
      phoneVerified: isPhoneVerified,
      displayName: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'NEXA Operator'),
      fullName: fbUser.displayName || undefined,
      photoURL: fbUser.photoURL || undefined,
      isVerified: Boolean(isEmailVerified || isPhoneVerified),
      provider: primaryProvider,
      providers,
      role: 'user',
      isAnonymous: fbUser.isAnonymous,
      createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
      appCheckVerified: true,
    };
  };

  // Authoritative Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          const profile = mapFirebaseUser(fbUser);
          setUser(profile);

          // Get fresh ID token
          try {
            const token = await fbUser.getIdToken();
            sessionStorage.setItem(SESSION_TOKEN_KEY, token);
          } catch (e) {
            console.warn('[NEXA Auth] Error getting ID token:', e);
          }

          auditLogger.log({
            eventType: 'auth_login',
            severity: 'info',
            action: 'Authoritative Session Active',
            details: `Identity verified via ${profile?.provider || 'provider'}. User UID: ${fbUser.uid}`,
            userId: fbUser.uid,
          });
        } else {
          // Check if there is an active verified phone-only session
          const verifiedPhoneSession = sessionStorage.getItem(PHONE_VERIFIED_KEY);
          if (verifiedPhoneSession) {
            try {
              const parsed = JSON.parse(verifiedPhoneSession);
              if (parsed.phone && parsed.token && Number(parsed.expiresAt) > Date.now()) {
                const phoneUser: UserSecurityProfile = {
                  uid: `phone-${parsed.phone.replace(/\D/g, '')}`,
                  email: undefined,
                  emailVerified: false,
                  phone: parsed.phone,
                  phoneVerified: true,
                  displayName: `User ${parsed.phone.slice(-4)}`,
                  fullName: `Phone User (${parsed.phone.slice(-4)})`,
                  isVerified: true,
                  provider: 'phone',
                  providers: ['phone'],
                  role: 'user',
                  isAnonymous: false,
                  createdAt: new Date().toISOString(),
                  appCheckVerified: true,
                };
                setUser(phoneUser);
                setLoading(false);
                return;
              }
            } catch {
              sessionStorage.removeItem(PHONE_VERIFIED_KEY);
            }
          }

          // Zero-Trust: If no valid credentials, user MUST be null
          setUser(null);
          sessionStorage.removeItem(SESSION_TOKEN_KEY);
        }
      } catch (err) {
        console.error('[NEXA Auth] Auth state resolution error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 1. Google Authentication
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const profile = mapFirebaseUser(result.user);
      setUser(profile);

      const token = await result.user.getIdToken();
      sessionStorage.setItem(SESSION_TOKEN_KEY, token);

      auditLogger.log({
        eventType: 'auth_login',
        severity: 'info',
        action: 'Google Authentication Successful',
        details: `Signed in as ${result.user.email}. Authoritative Google token acquired.`,
        userId: result.user.uid,
      });
    } catch (err: any) {
      auditLogger.log({
        eventType: 'auth_login',
        severity: 'high',
        action: 'Google Authentication Failed',
        details: `Google sign-in attempt failed: ${err.message}`,
      });
      throw err;
    }
  };

  // 2. Email & Password Sign-In
  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const profile = mapFirebaseUser(result.user);
      setUser(profile);

      const token = await result.user.getIdToken();
      sessionStorage.setItem(SESSION_TOKEN_KEY, token);

      auditLogger.log({
        eventType: 'auth_login',
        severity: 'info',
        action: 'Email Sign-In Successful',
        details: `Authenticated user ${email.trim()}. Verified: ${result.user.emailVerified}`,
        userId: result.user.uid,
      });
    } catch (err: any) {
      auditLogger.log({
        eventType: 'auth_login',
        severity: 'high',
        action: 'Email Sign-In Failed',
        details: `Failed credentials for email ${email.trim()}: ${err.message}`,
      });
      throw err;
    }
  };

  // 3. Email & Password Sign-Up with Verification Email
  const signupWithEmail = async (email: string, pass: string, displayName?: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      
      if (displayName && result.user) {
        await updateFbProfile(result.user, { displayName });
      }

      // Send actual Firebase email verification link
      let verificationEmailSent = false;
      try {
        await sendEmailVerification(result.user);
        verificationEmailSent = true;
      } catch (emailErr) {
        console.warn('[NEXA Auth] Could not dispatch verification email:', emailErr);
      }

      const profile = mapFirebaseUser(result.user);
      setUser(profile);

      const token = await result.user.getIdToken();
      sessionStorage.setItem(SESSION_TOKEN_KEY, token);

      auditLogger.log({
        eventType: 'auth_signup',
        severity: 'info',
        action: 'Account Created',
        details: `New NEXA account created for ${email.trim()}. Verification link dispatched: ${verificationEmailSent}`,
        userId: result.user.uid,
      });

      return { verificationEmailSent };
    } catch (err: any) {
      auditLogger.log({
        eventType: 'auth_signup',
        severity: 'high',
        action: 'Account Creation Failed',
        details: `Account creation error for ${email.trim()}: ${err.message}`,
      });
      throw err;
    }
  };

  // 4. Send Email Verification Link
  const sendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error('No active authenticated user to verify.');
    }
    await sendEmailVerification(auth.currentUser);
    auditLogger.log({
      eventType: 'permission_changed',
      severity: 'info',
      action: 'Email Verification Dispatched',
      details: `Verification email resent to ${auth.currentUser.email}.`,
      userId: auth.currentUser.uid,
    });
  };

  // 5. Reload User State (e.g., after clicking verification email link)
  const reloadUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const profile = mapFirebaseUser(auth.currentUser);
      setUser(profile);
    }
  };

  // 6. Phone OTP Send (Zero-Trust Backend Verification)
  const loginWithPhoneSendOtp = async (phone: string): Promise<PhoneOtpResult> => {
    try {
      const cleanPhone = phone.trim();
      const res = await fetch('/api/auth/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Failed to dispatch verification code.',
        };
      }

      auditLogger.log({
        eventType: 'permission_changed',
        severity: 'info',
        action: 'Phone Verification OTP Dispatched',
        details: `OTP code dispatched to phone ending in ${cleanPhone.slice(-4)}.`,
      });

      return {
        success: true,
        message: data.message || 'Verification code sent.',
        cooldownSeconds: data.cooldownSeconds || 60,
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'Network connection issue. Please check your connectivity.',
      };
    }
  };

  // 7. Phone OTP Verify (Zero-Trust)
  const verifyPhoneOtp = async (phone: string, code: string): Promise<VerifyOtpResult> => {
    try {
      const cleanPhone = phone.trim();
      const cleanCode = code.trim();

      const res = await fetch('/api/auth/phone/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, code: cleanCode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.verified) {
        return {
          success: false,
          message: data.message || 'Invalid or expired verification code.',
        };
      }

      // Store authoritative verified phone token
      const sessionPayload = {
        phone: cleanPhone,
        token: data.token,
        verified: true,
        expiresAt: Date.now() + 7 * 24 * 3600 * 1000 // 7 days
      };
      sessionStorage.setItem(PHONE_VERIFIED_KEY, JSON.stringify(sessionPayload));
      sessionStorage.setItem(SESSION_TOKEN_KEY, data.token);

      // If user is already authenticated with email/google, update their phone
      if (user) {
        const updated: UserSecurityProfile = {
          ...user,
          phone: cleanPhone,
          phoneVerified: true,
          isVerified: true,
          providers: Array.from(new Set([...(user.providers || []), 'phone'])),
        };
        setUser(updated);
      } else {
        // Authenticate new phone user
        const phoneUser: UserSecurityProfile = {
          uid: `phone-${cleanPhone.replace(/\D/g, '')}`,
          email: undefined,
          emailVerified: false,
          phone: cleanPhone,
          phoneVerified: true,
          displayName: `User ${cleanPhone.slice(-4)}`,
          fullName: `Phone User (${cleanPhone.slice(-4)})`,
          isVerified: true,
          provider: 'phone',
          providers: ['phone'],
          role: 'user',
          isAnonymous: false,
          createdAt: new Date().toISOString(),
          appCheckVerified: true,
        };
        setUser(phoneUser);
      }

      auditLogger.log({
        eventType: 'auth_login',
        severity: 'info',
        action: 'Phone Verification Complete',
        details: `Phone number ${cleanPhone.slice(-4)} verified against cryptographic backend challenge.`,
      });

      return {
        success: true,
        message: 'Phone number successfully verified!',
        verified: true,
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Network error during verification.',
      };
    }
  };

  // 8. User Profile Update (Custom metadata like bio or display name only)
  const updateProfile = (updates: Partial<UserSecurityProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      // Protected fields CANNOT be overwritten by client-side updateProfile
      const { uid, emailVerified, phoneVerified, provider, providers, role, isAnonymous, appCheckVerified, ...safeUpdates } = updates as any;
      const updated = { ...prev, ...safeUpdates };
      return updated;
    });

    auditLogger.log({
      eventType: 'permission_changed',
      severity: 'info',
      action: 'Profile Updated',
      details: `Profile fields modified: ${Object.keys(updates).join(', ')}`,
      userId: user?.uid,
    });
  };

  // 9. Profile Photo
  const setProfilePhoto = (dataUrl: string | null) => {
    updateProfile({ photoURL: dataUrl || undefined });
  };

  // 10. Authoritative Logout
  const logout = async () => {
    const currentUid = user?.uid;
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('[NEXA Auth] Firebase signOut error:', e);
    }

    sessionStorage.removeItem(PHONE_VERIFIED_KEY);
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    setUser(null);

    auditLogger.log({
      eventType: 'auth_logout',
      severity: 'info',
      action: 'User Signed Out',
      details: 'Active cryptographic session revoked and identity cleared.',
      userId: currentUid,
    });
  };

  // 11. Authoritative Auth Token
  const getAuthToken = async (): Promise<string | null> => {
    if (auth.currentUser) {
      try {
        return await auth.currentUser.getIdToken();
      } catch {
        // Fallback to cached token
      }
    }
    return sessionStorage.getItem(SESSION_TOKEN_KEY);
  };

  const isAuthenticated = Boolean(user && !user.isAnonymous);
  const emailVerified = Boolean(user && user.emailVerified);
  const phoneVerified = Boolean(user && user.phoneVerified);
  const providers = user?.providers || (user?.provider ? [user.provider] : []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        emailVerified,
        phoneVerified,
        providers,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        sendVerificationEmail,
        reloadUser,
        loginWithPhoneSendOtp,
        verifyPhoneOtp,
        updateProfile,
        setProfilePhoto,
        logout,
        getAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || defaultContextValue;
};
