import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { SevenDayAverages } from '../../../services/analyticsService';
import styles from './HydrationCard.module.css';

interface HydrationCardProps {
  averages:      SevenDayAverages;
  waterTarget:   number;
}

const HydrationCard: React.FC<HydrationCardProps> = ({ averages, waterTarget }) => {
  const navigate = useNavigate();
  const isDeficit = averages.hydration < waterTarget;

  return (
    <div className={`${styles.card} ${isDeficit ? styles.deficit : styles.ok}`}>
      <div className={styles.header}>
        <div className={`${styles.iconWrap} ${isDeficit ? styles.iconDeficit : styles.iconOk}`}>
          <i className="fa-solid fa-droplet" />
        </div>
        <h4 className={styles.title}>
          {isDeficit ? 'Hydration Deficit' : 'Hydration On Track'}
        </h4>
      </div>

      <p className={styles.body}>
        {isDeficit
          ? `Your water target is ${waterTarget.toFixed(1)} L/day. On workout days, try to add an extra 500 ml and consider an electrolyte mix for optimal performance.`
          : `Great work! You're meeting your ${waterTarget.toFixed(1)} L/day hydration target. Consistent hydration supports metabolism and muscle recovery.`}
      </p>

      <button
        className={styles.btn}
        onClick={() => navigate('/plan')}
      >
        {isDeficit ? 'Log Water Now' : 'View Plan'}
      </button>
    </div>
  );
};

export default HydrationCard;
