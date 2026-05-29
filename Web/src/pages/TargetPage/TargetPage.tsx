import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../components/Target/Target.module.css';
import { API_BASE_URL, getAuthHeaders } from '../../services/api';

interface TargetData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  updated_at: string;
}

const TargetPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<TargetData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTargetData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("userToken");

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      // Use the centralized API configuration
      const response = await fetch(`${API_BASE_URL}/daily-target`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userToken");
        navigate("/login");
        return;
      }

      const text = await response.text();
      let result;
      try {
        result = text ? JSON.parse(text) : {};
      } catch (e) {
        result = {};
      }

      if (response.ok && result.status === "success" && result.data) {
        setData(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch target data");
      }
    } catch (err: unknown) {
      console.error("API Error:", err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred while fetching your targets.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    Promise.resolve().then(() => fetchTargetData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render Loading State
  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <h2>Crunching your numbers...</h2>
          <p>Preparing your personalized daily targets</p>
        </div>
      </div>
    );
  }

  // Render Error State
  if (error) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.errorState}>
          <i className={`fa-solid fa-triangle-exclamation ${styles.errorIcon}`}></i>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button className={styles.retryButton} onClick={fetchTargetData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Fallback if data is null but not loading/error
  if (!data) return null;

  const proteinPercent = Math.min((data.protein / 300) * 100, 100);
  const carbsPercent = Math.min((data.carbs / 500) * 100, 100);
  const fatsPercent = Math.min((data.fats / 150) * 100, 100);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.bgDecoration}></div>

      <main className={styles.mainContent}>
        {/* Header section */}
        <header className={styles.header}>
          <div className={styles.headerInfo}>
            <h1>
              <i className="fa-solid fa-bullseye" style={{ color: '#10b981' }}></i>
              Your Daily Targets
            </h1>
            <p>
              <i className="fa-regular fa-clock"></i>
              Updated {data.updated_at}
            </p>
          </div>
          <button className={styles.homeButton} onClick={() => navigate('/dashboard')}>
            <i className="fa-solid fa-house"></i> Home Page
          </button>
        </header>

        {/* Dashboard Grid */}
        <div className={styles.dashboardGrid}>

          {/* Calories Highlight Card */}
          <div className={styles.caloriesCard}>
            <div className={styles.cardIconBox}>
              <i className="fa-solid fa-fire-flame-curved"></i>
            </div>
            <h3 className={styles.caloriesTitle}>Daily Caloric Goal</h3>
            <div className={styles.caloriesValue}>
              {Math.round(data.calories)}
              <span className={styles.caloriesUnit}> kcal</span>
            </div>
            <div className={styles.caloriesDesc}>
              Fuel your journey
            </div>
          </div>

          {/* Macros Details Section */}
          <div className={styles.macrosSection}>
            <h3 className={styles.macrosTitle}>
              <i className="fa-solid fa-chart-pie" style={{ color: '#8b5cf6' }}></i>
              Macronutrient Breakdown
            </h3>

            <div className={styles.macrosList}>
              {/* Protein Bar */}
              <div className={styles.macroItem}>
                <div className={styles.macroHeader}>
                  <div className={styles.macroLabel}>
                    <i className={`fa-solid fa-drumstick-bite ${styles.colorProtein}`}></i>
                    Protein
                  </div>
                  <div className={styles.macroValue}>
                    {data.protein} <span className={styles.macroUnit}>g</span>
                  </div>
                </div>
                <div className={styles.progressTrack}>
                  <div className={`${styles.progressFill} ${styles.fillProtein}`} style={{ width: `${proteinPercent}%` }}></div>
                </div>
              </div>

              {/* Carbs Bar */}
              <div className={styles.macroItem}>
                <div className={styles.macroHeader}>
                  <div className={styles.macroLabel}>
                    <i className={`fa-solid fa-wheat-awn ${styles.colorCarbs}`}></i>
                    Carbohydrates
                  </div>
                  <div className={styles.macroValue}>
                    {data.carbs} <span className={styles.macroUnit}>g</span>
                  </div>
                </div>
                <div className={styles.progressTrack}>
                  <div className={`${styles.progressFill} ${styles.fillCarbs}`} style={{ width: `${carbsPercent}%` }}></div>
                </div>
              </div>

              {/* Fats Bar */}
              <div className={styles.macroItem}>
                <div className={styles.macroHeader}>
                  <div className={styles.macroLabel}>
                    <i className={`fa-solid fa-cheese ${styles.colorFats}`}></i>
                    Fats
                  </div>
                  <div className={styles.macroValue}>
                    {data.fats} <span className={styles.macroUnit}>g</span>
                  </div>
                </div>
                <div className={styles.progressTrack}>
                  <div className={`${styles.progressFill} ${styles.fillFats}`} style={{ width: `${fatsPercent}%` }}></div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default TargetPage;
