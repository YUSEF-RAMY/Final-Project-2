/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

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

  const startProcessing = useCallback((message: string) => {
    setState({
      status: 'processing',
      message,
      redirectUrl: null,
      isVisible: true,
    });
  }, []);

  const finishProcessing = useCallback((message: string, redirectUrl?: string) => {
    setState((prev) => ({
      ...prev,
      status: 'done',
      message,
      redirectUrl: redirectUrl || null,
    }));

    // Optional auto-dismiss after 5 seconds if no redirect URL is provided
    if (!redirectUrl) {
      setTimeout(() => {
        setState(prev => ({ ...prev, isVisible: false }));
      }, 5000);
    }
  }, []);

  const closeNotification = useCallback(() => {
    setState((prev) => ({ ...prev, isVisible: false }));
    // Reset status after animation
    setTimeout(() => {
      setState((prev) => ({ ...prev, status: 'idle', message: '' }));
    }, 400);
  }, []);

  const uploadAnalysis = useCallback(async (formData: FormData, endpoint: string, token: string, isImageMode: boolean) => {
    let oldCreatedAt: string | null = null;

    if (isImageMode) {
      startProcessing("Processing...");
      try {
        // 1. Fetch current (old) state to get its created_at timestamp
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
        console.warn("Could not fetch old inbody data before upload", e);
      }
    }

    try {
      // 2. Perform the upload
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
          // 3. Start Polling for the new result
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
                  const isNew = newData.created_at !== oldCreatedAt;
                  const isComplete = newData.protein && (newData.image || newData.inbody_image);

                  if (isNew && isComplete) {
                    isPolling = false;
                    finishProcessing("Done ✓", "/analysis-inbody");
                    return;
                  }
                }
              }
            } catch (pollErr) {
              console.error("Polling error:", pollErr);
            }

            // If not finished and still polling, schedule the next check quickly
            if (isPolling) {
              setTimeout(checkStatus, 800); // Very fast 800ms interval
            }
          };

          // Trigger the very first check instantly
          checkStatus();
          
          // Failsafe timeout after 5 minutes
          setTimeout(() => {
            isPolling = false;
          }, 5 * 60 * 1000);
          
        } else {
          // Manual mode doesn't necessarily need the sticky banner
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
