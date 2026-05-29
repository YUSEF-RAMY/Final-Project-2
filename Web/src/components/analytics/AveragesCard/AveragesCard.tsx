import React from 'react';
import type { SevenDayAverages } from '../../../services/analyticsService';
import styles from './AveragesCard.module.css';

interface AveragesCardProps {
  averages: SevenDayAverages;
}

const AveragesCard: React.FC<AveragesCardProps> = ({ averages }) => {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>7-Day Averages</h3>

      <div className={styles.rows}>
        <div className={styles.row}>
          <span className={`${styles.dot} ${styles.dotGreen}`} />
          <span className={styles.name}>Caloric Intake</span>
          <span className={styles.value}>
            {averages.daysWithData > 0 ? Math.round(averages.calories).toLocaleString() : '—'}
            <span className={styles.unit}> kcal</span>
          </span>
        </div>

        <div className={styles.row}>
          <span className={`${styles.dot} ${styles.dotOrange}`} />
          <span className={styles.name}>Protein</span>
          <span className={`${styles.value} ${styles.valueOrange}`}>
            {averages.daysWithData > 0 ? Math.round(averages.protein) : '—'}
            <span className={styles.unit}> g</span>
          </span>
        </div>

        <div className={styles.row}>
          <span className={`${styles.dot} ${styles.dotBlue}`} />
          <span className={styles.name}>Hydration</span>
          <span className={styles.value}>
            {averages.hydration.toFixed(1)}
            <span className={styles.unit}> L</span>
          </span>
        </div>
      </div>

      {averages.daysWithData < 3 && (
        <p className={styles.hint}>
          <i className="fa-solid fa-circle-info" />
          Log meals for {3 - averages.daysWithData} more day{averages.daysWithData === 2 ? '' : 's'} to see full averages.
        </p>
      )}
    </div>
  );
};

export default AveragesCard;
