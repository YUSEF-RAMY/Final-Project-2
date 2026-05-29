import React, { useState } from 'react';
import { usePlan } from '../../../hooks/usePlan';
import MealPlanCards from '../MealPlanCards/MealPlanCards';
import SummaryPanel from '../SummaryPanel/SummaryPanel';
import LogMealModal from '../LogMealModal/LogMealModal';
import EditTargetsModal from '../EditTargetsModal/EditTargetsModal';
import styles from './PlanContent.module.css';

const PlanContent: React.FC = () => {
  const { data, loading, error, refetch } = usePlan();
  const [showLogModal, setShowLogModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.pageHeader}>
          <div className={`${styles.skeletonBlock} ${styles.skeletonTitle}`} />
          <div className={`${styles.skeletonBlock} ${styles.skeletonSubtitle}`} />
        </div>
        <div className={styles.contentGrid}>
          <div className={styles.mealColumn}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`${styles.skeletonBlock} ${styles.skeletonCard}`} />
            ))}
          </div>
          <div className={styles.summaryColumn}>
            <div className={`${styles.skeletonBlock} ${styles.skeletonPanel}`} />
          </div>
        </div>
        <button className={styles.logMealBtn} disabled>
          <i className="fa-solid fa-plus" /> Log Meal
        </button>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className={styles.errorState}>
        <i className="fa-solid fa-triangle-exclamation" />
        <h3>Couldn't load your nutrition plan</h3>
        <p>{error || 'No data available.'}</p>
        <button onClick={refetch}>Try Again</button>
      </div>
    );
  }

  const { summary, profile } = data;

  return (
    <div className={styles.wrapper}>
      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Daily Nutrition Plan</h1>
        <p className={styles.pageSubtitle}>
          Curated to meet your weight loss and energy targets.
        </p>
      </div>

      {/* ── Main two-column layout ──────────────────────────────────────────── */}
      <div className={styles.contentGrid}>
        <div className={styles.mealColumn}>
          <MealPlanCards mealTargets={summary.meal_targets} />
        </div>
        <div className={styles.summaryColumn}>
          <SummaryPanel
            profile={profile}
            totalCalories={summary.overview.target.calories}
            onEditTargets={() => setShowEditModal(true)}
          />
        </div>
      </div>

      {/* ── Floating "+ Log Meal" button ────────────────────────────────────── */}
      <button className={styles.logMealBtn} onClick={() => setShowLogModal(true)}>
        <i className="fa-solid fa-plus" /> Log Meal
      </button>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {showLogModal && (
        <LogMealModal
          onClose={() => setShowLogModal(false)}
          onSuccess={() => { setShowLogModal(false); refetch(); }}
        />
      )}
      {showEditModal && (
        <EditTargetsModal
          initialTargets={profile.nutritional_targets}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => { setShowEditModal(false); refetch(); }}
        />
      )}
    </div>
  );
};

export default PlanContent;
