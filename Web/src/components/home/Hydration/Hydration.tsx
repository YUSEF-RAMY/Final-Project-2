import React from 'react';
import type { MacroData } from '../../../services/dailySummaryService';
import styles from './Hydration.module.css';

interface HydrationProps {
  targetData: MacroData;
}

const Hydration: React.FC<HydrationProps> = ({ targetData }) => {
  const targetCalories = Math.round(targetData?.calories || 2400);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Target cal</h3>
        <i className={`fa-solid fa-bullseye ${styles.dropIcon}`}></i>
      </div>

      <div className={styles.waterContainer}>
        <div className={styles.waterLevel}>
          <div className={styles.waterWave}></div>
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.volume}>{targetCalories.toLocaleString()} kcal</span>
        <button className={styles.addButton}>
          <i className="fa-solid fa-plus"></i>
        </button>
      </div>
    </div>
  );
};

export default Hydration;
