import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import InBodyStats from '../components/AnalysisInBody/InBodyStats';
import type { InBodyData } from '../components/AnalysisInBody/types';
import styles from '../components/AnalysisInBody/InBody.module.css';

const BASE_URL = import.meta.env.API_BASE_URL;

import { useNotification } from '../context/NotificationContext';

interface ExtendedInBodyData extends InBodyData {
  inbody_image?: string;
  file_path?: string;
}

const AnalysisInBodyPage: React.FC = () => {
  useNotification();
  const [inBodyData, setInBodyData] = useState<ExtendedInBodyData | null>(null);
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
      const response = await fetch(`${BASE_URL}/inbody/latest`, {
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

      if (result.status === "success" && result.data) {
        const newData = result.data as ExtendedInBodyData;

        setInBodyData(prev => {
          if (JSON.stringify(prev) === JSON.stringify(newData)) return prev;
          return newData;
        });

        setError(null);

        // Stop polling as we have the final data
        if (newData.protein && (newData.image || newData.inbody_image)) {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
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

  const imageUrl = useMemo(() => {
    if (!inBodyData) return null;
    const path = inBodyData.image || inBodyData.inbody_image || inBodyData.file_path;
    if (!path) return null;
    return path.startsWith('http') ? path : `${BASE_URL}${path}`;
  }, [inBodyData]);

  return (
    <div className={styles.pageWrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <i className="fa-solid fa-leaf"></i> Healthyfy
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

        <button
          className={styles.continueButton}
          onClick={() => window.location.href = '/target'}
          disabled={!inBodyData}
        >
          Continue to Target Page <i className="fa-solid fa-arrow-right"></i>
        </button>
      </aside>

      <main className={styles.mainContent}>
        <InBodyStats data={inBodyData} />
      </main>
    </div>
  );
};

export default AnalysisInBodyPage;