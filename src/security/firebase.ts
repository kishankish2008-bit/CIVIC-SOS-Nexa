import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  Auth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFbProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User as FirebaseUser
} from 'firebase/auth';

// Standard Firebase configuration for NEXA web client
const metaEnv = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || 'AIzaSyA_NEXA_Universal_Bridge_Demo_Key_9982',
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || 'nexa-universal-bridge.firebaseapp.com',
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || 'nexa-universal-bridge',
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || 'nexa-universal-bridge.appspot.com',
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '829102938102',
  appId: metaEnv.VITE_FIREBASE_APP_ID || '1:829102938102:web:981293a81b28c'
};

let app: FirebaseApp;
let auth: Auth;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (err) {
  console.warn('[NEXA Auth] Firebase initialisation warning:', err);
  // Re-initialise or fallback
  app = initializeApp(firebaseConfig, 'nexa-action-bridge');
  auth = getAuth(app);
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export {
  app,
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  updateFbProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber
};

export type { FirebaseUser, ConfirmationResult };
