import React from 'react';
import { useAnalytics } from '../../../hooks/useAnalytics';
import WeightChart    from '../WeightChart/WeightChart';
import BMICard        from '../BMICard/BMICard';
import InBodyTable    from '../InBodyTable/InBodyTable';
import AIAnalysisCard from '../AIAnalysisCard/AIAnalysisCard';
import AveragesCard   from '../AveragesCard/AveragesCard';
import HydrationCard  from '../HydrationCard/HydrationCard';
import styles from './AnalyticsContent.module.css';

const AnalyticsContent: React.FC = () => {
  const { data, loading, error, refetch } = useAnalytics();

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.pageHeader}>
          <div className={`${styles.skel} ${styles.skelTitle}`} />
          <div className={`${styles.skel} ${styles.skelSub}`} />
        </div>
        <div className={styles.mainGrid}>
          <div className={styles.leftCol}>
            <div className={`${styles.skel} ${styles.skelChart}`} />
            <div className={styles.bottomRow}>
              <div className={`${styles.skel} ${styles.skelBmi}`} />
              <div className={`${styles.skel} ${styles.skelTable}`} />
            </div>
          </div>
          <div className={styles.rightCol}>
            <div className={`${styles.skel} ${styles.skelCard}`} />
            <div className={`${styles.skel} ${styles.skelCard}`} />
            <div className={`${styles.skel} ${styles.skelCard}`} />
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className={styles.errorState}>
        <i className="fa-solid fa-triangle-exclamation" />
        <h3>Couldn't load analytics</h3>
        <p>{error || 'No data available.'}</p>
        <button onClick={refetch}>Try Again</button>
      </div>
    );
  }

  const { profile, history, averages, insight } = data;
  const bmi         = Number(profile?.latest_body_report?.bmi ?? 0);
  const waterTarget = Number(localStorage.getItem('hfy_water_target')) || 2.5;

  return (
    <div className={styles.wrapper}>
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Metabolic Vitality</h1>
        <p className={styles.pageSub}>
          Tracking your physiological response to your current nutritional protocol over the last 90 days.
        </p>
      </div>

      {/* ── Two-column grid ──────────────────────────────────────────────── */}
      <div className={styles.mainGrid}>

        {/* Left column */}
        <div className={styles.leftCol}>
          <WeightChart history={history} />

          <div className={styles.bottomRow}>
            <BMICard bmi={bmi} />
            <InBodyTable history={history} />
          </div>
        </div>

        {/* Right column */}
        <div className={styles.rightCol}>
          <AIAnalysisCard insight={insight} />
          <AveragesCard   averages={averages} />
          <HydrationCard  averages={averages} waterTarget={waterTarget} />
        </div>

      </div>
    </div>
  );
};

export default AnalyticsContent;
