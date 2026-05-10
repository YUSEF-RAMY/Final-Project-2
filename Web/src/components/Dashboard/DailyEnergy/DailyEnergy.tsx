import React, { useEffect, useState } from 'react';
import styles from './DailyEnergy.module.css';

const DailyEnergy: React.FC = () => {
  const eaten = 1840;
  const target = 2400;
  const remaining = target - eaten;
  
  const percentage = Math.min((eaten / target) * 100, 100);
  
  // Calculate progress circle size
  const strokeDasharray = `${percentage}, 100`;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Daily Energy</h3>
      </div>
      
      <div className={styles.progressContainer}>
        <svg viewBox="0 0 36 36" className={styles.circularChart}>
          <path className={styles.circleBg}
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path className={styles.circle}
            strokeDasharray={strokeDasharray}
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            stroke="#10b981"
          />
        </svg>
        <div className={styles.progressText}>
          <span className={styles.kcalValue}>{eaten.toLocaleString()}</span>
          <span className={styles.kcalLabel}>KCAL EATEN</span>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Remaining</span>
          <span className={styles.statValue}>{remaining.toLocaleString()} kcal</span>
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
