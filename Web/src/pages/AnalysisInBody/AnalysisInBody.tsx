import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import InBodyStats from '../../components/AnalysisInBody/InBodyStats';
import type { InBodyData } from '../../components/AnalysisInBody/types';
import styles from '../../components/AnalysisInBody/InBody.module.css';
import { API_BASE_URL, resolveImageUrl } from '../../services/api';

import { useNotification } from '../../context/NotificationContext';

interface ExtendedInBodyData extends InBodyData {
  inbody_image?: string;
  file_path?: string;
}

const AnalysisInBodyPage: React.FC = () => {
  useNotification();
  const [inBodyData, setInBodyData] = useState<ExtendedInBodyData | null>(null);
  const [inBodyHistory, setInBodyHistory] = useState<ExtendedInBodyData[]>([]);
  const selectedIdRef = useRef<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLatestData = useCallback(async (signal?: AbortSignal) => {
    const token = localStorage.getItem("token") || localStorage.getItem("userToken");

    if (!token) {
      setError("No authentication token found.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/inbody/history`, {
        signal,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': '69420'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userToken");
        window.location.href = "/login";
        return;
      }

      const result = await response.json();

      if (result.status === "success" && Array.isArray(result.data)) {
        const historyData = result.data as ExtendedInBodyData[];
        setInBodyHistory(historyData);

        if (historyData.length > 0) {
          const selectedId = selectedIdRef.current;
          const selected = selectedId ? historyData.find((r: any) => r.id?.toString() === selectedId) || historyData[0] : historyData[0];
          
          setInBodyData(prev => {
            if (JSON.stringify(prev) === JSON.stringify(selected)) return prev;
            return selected;
          });

          setError(null);

          // Stop polling if we see it's no longer processing on backend,
          // or if we have some data that signifies completion
          if (historyData[0].protein || historyData[0].created_at) {
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error("API Error:", err.message);
        setError("Failed to sync with server.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const initialFetchTimeout = setTimeout(() => {
      fetchLatestData(controller.signal);
    }, 0);

    pollingRef.current = setInterval(() => {
      fetchLatestData(controller.signal);
    }, 10000);

    return () => {
      controller.abort();
      clearTimeout(initialFetchTimeout);
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [fetchLatestData]);

  const { state: notifState } = useNotification();
  const prevStatus = useRef(notifState.status);

  useEffect(() => {
    // If notification state transitions to done, trigger a fetch
    if (prevStatus.current === 'processing' && notifState.status === 'done') {
      const controller = new AbortController();
      fetchLatestData(controller.signal);
      return () => controller.abort();
    }
    prevStatus.current = notifState.status;
  }, [notifState.status, fetchLatestData]);

  const imageUrl = useMemo(() => {
    if (!inBodyData) return null;
    const path = inBodyData.image || inBodyData.inbody_image || inBodyData.file_path;
    if (!path) return null;
    return resolveImageUrl(path);
  }, [inBodyData]);

  return (
    <div className={styles.pageWrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <i className="fa-solid fa-leaf"></i> Healthify
        </div>

        <h2 className={styles.sidebarTitle}>Precision starts here.</h2>

        <div className={styles.userBriefCard}>
          <div className={styles.briefItem}>
            <i className="fa-solid fa-venus-mars"></i>
            <div>
              <strong>Gender</strong>
              <span>{inBodyData?.gender || '--'}</span>
            </div>
          </div>
          <div className={styles.briefItem}>
            <i className="fa-solid fa-calendar-day"></i>
            <div>
              <strong>Age</strong>
              <span>{inBodyData?.age ? `${inBodyData.age} yrs` : '--'}</span>
            </div>
          </div>
        </div>

        <div className={styles.imagePreviewZone}>
          {loading && !inBodyData ? (
            <div className={styles.noImagePlaceholder}>
              <div className={styles.loaderRing}></div>
              <p>Fetching Data...</p>
            </div>
          ) : imageUrl ? (
            <div className={styles.imageContainer}>
              <img
                src={imageUrl}
                alt="InBody Scan Result"
                className={styles.previewImage}
                onLoad={(e) => (e.currentTarget.style.opacity = "1")}
                style={{ opacity: 0, transition: 'opacity 0.5s' }}
              />
              <div className={styles.imageOverlay}>Scan Preview</div>
            </div>
          ) : (
            <div className={styles.noImagePlaceholder}>
              <i className="fa-solid fa-file-circle-xmark"></i>
              <p>{error ? "Connection Error" : "No Scan Found"}</p>
            </div>
          )}
        </div>

        <div className={styles.aiInfoCard}>
          <h4 className={styles.aiCardTitle}>
            <i className="fa-solid fa-wand-magic-sparkles"></i> AI Status
          </h4>
          <p className={styles.aiCardText}>
            {inBodyData
              ? `Analysis ready for ${inBodyData.weight}kg body mass.`
              : error || "Waiting for your latest InBody data..."}
          </p>
        </div>

        {inBodyHistory.length > 1 && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', color: '#666' }}>
              <i className="fa-solid fa-clock-rotate-left"></i> Previous Scans
            </label>
            <select
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f9fafb', color: '#374151' }}
              value={selectedIdRef.current || (inBodyHistory[0] as any).id || ''}
              onChange={(e) => {
                const id = e.target.value;
                selectedIdRef.current = id;
                const selected = inBodyHistory.find((r: any) => r.id?.toString() === id);
                if (selected) setInBodyData(selected);
              }}
            >
              {inBodyHistory.map((report: any) => {
                const dateStr = report.measured_at || report.created_at || '';
                const date = dateStr ? new Date(dateStr).toLocaleDateString() : 'Unknown Date';
                return (
                  <option key={report.id} value={report.id}>
                    {date} - {report.weight}kg
                  </option>
                );
              })}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            className={styles.continueButton}
            onClick={() => window.location.href = '/target'}
            disabled={!inBodyData}
          >
            Continue to Target Page <i className="fa-solid fa-arrow-right"></i>
          </button>
          
          <button
            className={styles.continueButton}
            style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}
            onClick={() => window.location.href = '/analytics'}
          >
            View Progress Analytics <i className="fa-solid fa-chart-line"></i>
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <InBodyStats data={inBodyData} />
      </main>
    </div>
  );
};

export default AnalysisInBodyPage;