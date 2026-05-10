import React from 'react';
import type { MacroData } from '../../../services/dailySummaryService';
import styles from './DailyEnergy.module.css';

interface DailyEnergyProps {
  remainingData: MacroData;
  consumedData: MacroData;
  targetData: MacroData;
}

const DailyEnergy: React.FC<DailyEnergyProps> = ({ remainingData, consumedData, targetData }) => {
  const eaten = Math.round(consumedData?.calories || 0);
  const target = Math.round(targetData?.calories || 2400);
  const remaining = Math.round(remainingData?.calories || 0);
  
  // Circular progress shows % consumed vs target
  const percentage = target > 0 ? Math.min((eaten / target) * 100, 100) : 0;
  const strokeDasharray = `${percentage}, 100`;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Remaining cal</h3>
      </div>
      
      <div className={styles.progressContainer}>
        <svg viewBox="0 0 36 36" className={styles.circularChart}>
          <path
            className={styles.circleBg}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={styles.circle}
            strokeDasharray={strokeDasharray}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            stroke="#10b981"
          />
        </svg>
        <div className={styles.progressText}>
          <span className={styles.kcalValue}>{remaining.toLocaleString()}</span>
          <span className={styles.kcalLabel}>REMAINING</span>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Consumed</span>
          <span className={styles.statValue}>{eaten.toLocaleString()} kcal</span>
        </div>
        <div className={`${styles.statItem} ${styles.target}`}>
          <span className={styles.statLabel}>Target</span>
          <span className={styles.statValue}>{target.toLocaleString()} kcal</span>
        </div>
      </div>
    </div>
  );
};

export default DailyEnergy;
