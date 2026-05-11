/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { requestForToken, onMessageListener } from '../services/firebase/messaging';

type NotificationStatus = 'idle' | 'processing' | 'done';

interface NotificationState {
  status: NotificationStatus;
  message: string;
  redirectUrl: string | null;
  isVisible: boolean;
}

interface NotificationContextType {
  state: NotificationState;
  startProcessing: (message: string) => void;
  finishProcessing: (message: string, redirectUrl?: string) => void;
  closeNotification: () => void;
  uploadAnalysis: (formData: FormData, endpoint: string, token: string, isImageMode: boolean) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NotificationState>({
    status: 'idle',
    message: '',
    redirectUrl: null,
    isVisible: false,
  });

  // This ref stops FCM and the polling fallback from both firing "Done" at the same time
  const isFinishedRef = useRef(false);

  const startProcessing = useCallback((message: string) => {
    isFinishedRef.current = false; // clear the lock so the next upload starts fresh
    setState({
      status: 'processing',
      message,
      redirectUrl: null,
      isVisible: true,
    });
  }, []);

  const finishProcessing = useCallback((message: string, redirectUrl?: string) => {
    // Make sure only one of the two channels (FCM or polling) can trigger the done state
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;

    // Always bring the banner back even if the user dismissed it while we were waiting
    setState({
      status: 'done',
      message,
      redirectUrl: redirectUrl || null,
      isVisible: true,
    });
  }, []);

  const closeNotification = useCallback(() => {
    setState((prev) => ({ ...prev, isVisible: false }));
    // Wait for the hide animation to finish before actually clearing the state
    setTimeout(() => {
      setState((prev) => {
        if (prev.status === 'done') {
          return { ...prev, status: 'idle', message: '' };
        }
        return prev;
      });
    }, 400);
  }, []);

  // Both FCM (foreground) and BroadcastChannel (when the tab was in background) can fire
  // for the same push. We track whether we've handled it already to avoid showing "Done" twice.
  useEffect(() => {
    let isMounted = true;
    // One flag per push so we don't handle the same notification twice
    let currentPushHandled = false;

    const handleDone = () => {
      if (!isMounted || currentPushHandled) return;
      currentPushHandled = true;
      finishProcessing('Done ✓', '/analysis-inbody');
    };

    const listenToFCM = async () => {
      try {
        await requestForToken();
        const payload: any = await onMessageListener();
        if (payload) handleDone();
      } catch (err) {
        console.warn('FCM listener error', err);
      }
    };

    listenToFCM();

    const channel = new BroadcastChannel('fcm-messages');
    channel.onmessage = (event) => {
      if (event.data) handleDone();
    };

    return () => {
      isMounted = false;
      channel.close();
    };
  }, [finishProcessing]);

  const uploadAnalysis = useCallback(async (formData: FormData, endpoint: string, token: string, isImageMode: boolean) => {
    let oldCreatedAt: string | null = null;

    if (isImageMode) {
      startProcessing("Processing...");

      // Grab the current result's timestamp so we can tell if a new one comes in later
      try {
        const latestRes = await fetch(`${BASE_URL}/inbody/latest`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        });
        if (latestRes.ok) {
          const latestData = await latestRes.json();
          if (latestData?.data?.created_at) {
            oldCreatedAt = latestData.data.created_at;
          }
        }
      } catch (e) {
        console.warn("Couldn't read the old InBody result before upload — that's fine", e);
      }

      // Give the backend our FCM token so it knows where to send the push when it's done
      const fcmToken = await requestForToken();
      if (fcmToken) {
        formData.append('fcm_token', fcmToken);
      }
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: formData
      });

      if (response.ok) {
        localStorage.removeItem("analysis_notified");

        if (isImageMode) {
          // FCM is the primary signal. Polling every 3s is just a safety net in case the push never arrives.
          let isPolling = true;

          const checkStatus = async () => {
            if (!isPolling) return;
            try {
              const pollRes = await fetch(`${BASE_URL}/inbody/latest`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'application/json',
                  'ngrok-skip-browser-warning': 'true'
                }
              });

              if (pollRes.ok) {
                const pollResult = await pollRes.json();
                if (pollResult.status === "success" && pollResult.data) {
                  const newData = pollResult.data;
                  // Only mark as done if this is genuinely new data that has fully finished processing
                  const isNew = newData.created_at !== oldCreatedAt;
                  const isComplete = newData.protein && (newData.image || newData.inbody_image);

                  if (isNew && isComplete) {
                    isPolling = false;
                    // finishProcessing is guarded by the ref-lock so it's safe to call from both paths
                    finishProcessing("Done ✓", "/analysis-inbody");
                    return;
                  }
                }
              }
            } catch (pollErr) {
              console.error("Fallback polling error:", pollErr);
            }

            if (isPolling) {
              setTimeout(checkStatus, 3000);
            }
          };

          checkStatus();

          // Give up after 5 minutes regardless — something must have gone wrong on the server
          setTimeout(() => {
            isPolling = false;
          }, 5 * 60 * 1000);
        }
      } else {
        const err = await response.json();
        console.error("Upload failed:", err);
        closeNotification();
      }
    } catch (error) {
      console.error("Submission error:", error);
      closeNotification();
    }
  }, [startProcessing, finishProcessing, closeNotification]);

  return (
    <NotificationContext.Provider value={{ state, startProcessing, finishProcessing, closeNotification, uploadAnalysis }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
