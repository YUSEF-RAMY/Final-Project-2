import React from 'react';
import styles from './Insights.module.css';

const Insights: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <i className={`fa-solid fa-lightbulb ${styles.icon}`}></i>
        <h3 className={styles.title}>AI Insights</h3>
      </div>

      <div className={styles.alertCard}>
        <span className={styles.alertBadge}>ALERT</span>
        <p className={styles.alertText}>
          Protein deficit detected for current muscle-gain goal. Consider adding 20g in dinner.
        </p>
      </div>

      <div className={styles.trendCard}>
        <span className={styles.trendBadge}>TREND</span>
        <p className={styles.trendText}>
          Your hydration is peaking earlier today, excellent for evening metabolism.
        </p>
      </div>

      <div className={styles.editorialCard}>
        <span className={styles.editorialBadge}>EDITORIAL</span>
        <h4 className={styles.editorialTitle}>The Science of Satiety</h4>
        <a href="#" className={styles.readMore}>
          Read Article <i className="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    </div>
  );
};

export default Insights;
