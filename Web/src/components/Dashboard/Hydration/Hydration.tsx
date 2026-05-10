import React from 'react';
import styles from './Hydration.module.css';

const Hydration: React.FC = () => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Hydration</h3>
        <i className={`fa-solid fa-droplet ${styles.dropIcon}`}></i>
      </div>

      <div className={styles.waterContainer}>
        <div className={styles.waterLevel}>
          <div className={styles.waterWave}></div>
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.volume}>1.2L / 2.5L</span>
        <button className={styles.addButton}>
          <i className="fa-solid fa-plus"></i>
        </button>
      </div>
    </div>
  );
};

export default Hydration;
