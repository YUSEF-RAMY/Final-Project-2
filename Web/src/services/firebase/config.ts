import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase only if the config exists to prevent app crash
export const app = (() => {
  if (!firebaseConfig.projectId) {
    console.warn("Firebase configuration is missing! Please add VITE_FIREBASE_* variables to your .env file.");
    return null;
  }
  return !getApps().length ? initializeApp(firebaseConfig) : getApp();
})();
