import { getMessaging, getToken, onMessage } from "firebase/messaging";
import type { MessagePayload } from "firebase/messaging";
import { app } from "./config";

// Initialize Firebase Cloud Messaging only if app exists
export const messaging = app ? getMessaging(app) : null;

export const requestForToken = async (): Promise<string | null> => {
  if (!messaging) {
    console.warn('Firebase Messaging is not initialized. Notifications will not work.');
    return null;
  }

  try {
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('VITE_FIREBASE_VAPID_KEY is missing in environment variables.');
      return null;
    }

    const currentToken = await getToken(messaging, { vapidKey });
    
    if (currentToken) {
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      // This will prompt the user for notification permissions
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
         return await getToken(messaging, { vapidKey });
      }
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    return null;
  }
};

export const onMessageListener = (): Promise<MessagePayload | null> =>
  new Promise((resolve) => {
    if (!messaging) {
      resolve(null);
      return;
    }
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
