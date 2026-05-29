import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../../../services/profileService';
import styles from './SummaryPanel.module.css';

interface SummaryPanelProps {
  profile: UserProfile;
  totalCalories: number;
  onEditTargets: () => void;
}

// Clamps a BMI value to a 0-100 percentage position on the gauge bar.
// Range modelled: 15 (far under) → 35 (far over).
function bmiToPercent(bmi: number): number {
  const min = 15;
  const max = 35;
  return Math.min(Math.max(((bmi - min) / (max - min)) * 100, 2), 98);
}

function getBmiLabel(bmi: number): string {
  if (bmi < 18.5) return 'Under';
  if (bmi < 25)   return 'Normal';
  return 'Over';
}

// Water and activity targets are stored locally since the API does not expose them.
const STORAGE_WATER    = 'hfy_water_target';
const STORAGE_ACTIVITY = 'hfy_activity_target';

const SummaryPanel: React.FC<SummaryPanelProps> = ({
  profile,
  totalCalories,
  onEditTargets,
}) => {
  const bmi     = Number(profile.latest_body_report?.bmi ?? 0);
  const bmiPct  = bmiToPercent(bmi);
  const bmiLbl  = getBmiLabel(bmi);

  const objective = profile.physical_profile?.primary_objective ?? 'Steady Weight Loss';

  // Load water / activity from localStorage with sensible defaults.
  const [water,    setWater]    = useState<number>(() => Number(localStorage.getItem(STORAGE_WATER))    || 2.5);
  const [activity, setActivity] = useState<number>(() => Number(localStorage.getItem(STORAGE_ACTIVITY)) || 10000);

  // Re-read when localStorage changes (e.g. after EditTargetsModal saves).
  useEffect(() => {
    const handleStorage = () => {
      setWater(Number(localStorage.getItem(STORAGE_WATER))    || 2.5);
      setActivity(Number(localStorage.getItem(STORAGE_ACTIVITY)) || 10000);
    };
    window.addEventListener('storage', handleStorage);
    // Also listen for custom event fired from EditTargetsModal on same tab.
    window.addEventListener('hfy:targets-updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('hfy:targets-updated', handleStorage);
    };
  }, []);

  const activityDisplay =
    activity >= 1000 ? `${(activity / 1000).toFixed(0)}k` : String(activity);

  return (
    <div className={styles.panel}>
      {/* ── Active plan badge ─────────────────────────────────────────────── */}
      <div className={styles.planBadge}>
        <span className={styles.badgeDot} />
        ADVANCED PLAN ACTIVE
      </div>

      {/* ── Current focus ─────────────────────────────────────────────────── */}
      <div className={styles.focusSection}>
        <span className={styles.focusLabel}>CURRENT FOCUS</span>
        <h2 className={styles.focusTitle}>{objective.replace(/_/g, ' ')}</h2>
      </div>

      {/* ── BMI card ──────────────────────────────────────────────────────── */}
      {bmi > 0 && (
        <div className={styles.bmiCard}>
          <div className={styles.bmiHeader}>
            <span className={styles.bmiLabel}>Current BMI</span>
            <span className={styles.bmiValue}>{bmi.toFixed(1)}</span>
          </div>
          {/* Gauge bar */}
          <div className={styles.gaugeTrack}>
            <div
              className={styles.gaugeDot}
              style={{ left: `${bmiPct}%` }}
              title={`BMI: ${bmi.toFixed(1)} (${bmiLbl})`}
            />
          </div>
          <div className={styles.gaugeLabels}>
            <span>UNDER</span>
            <span>NORMAL</span>
            <span>OVER</span>
          </div>
        </div>
      )}

      {/* ── Daily targets summary ─────────────────────────────────────────── */}
      <div className={styles.targetsSection}>
        <span className={styles.targetsLabel}>DAILY TARGETS SUMMARY</span>

        <div className={styles.targetRow}>
          <div className={styles.targetIcon} style={{ color: '#3b82f6' }}>
            <i className="fa-solid fa-droplet" />
          </div>
          <span className={styles.targetName}>Water</span>
          <span className={styles.targetVal}>{water.toFixed(1)} L</span>
        </div>

        <div className={styles.targetRow}>
          <div className={styles.targetIcon} style={{ color: '#f97316' }}>
            <i className="fa-solid fa-person-walking" />
          </div>
          <span className={styles.targetName}>Activity</span>
          <span className={styles.targetVal}>{activityDisplay} steps</span>
        </div>

        <div className={styles.targetRow}>
          <div className={styles.targetIcon} style={{ color: '#10b981' }}>
            <i className="fa-solid fa-fork-knife" />
          </div>
          <span className={styles.targetName}>Calories</span>
          <span className={styles.targetVal}>
            {Math.round(totalCalories).toLocaleString()} kcal
          </span>
        </div>
      </div>

      {/* ── Edit Targets button ───────────────────────────────────────────── */}
      <button className={styles.editBtn} onClick={onEditTargets}>
        Edit Targets
      </button>
    </div>
  );
};

export default SummaryPanel;
