import React from 'react';
import styles from './MealPlan.module.css';

const MealPlan: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Today's Blueprint</h3>
        <p className={styles.subtitle}>Your structured metabolic intake.</p>
      </div>

      {/* Breakfast */}
      <div className={styles.card}>
        <div className={styles.iconBox} style={{ color: '#10b981', backgroundColor: '#ecfdf5' }}>
          <i className="fa-regular fa-sun"></i>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.cardHeader}>
            <span className={styles.mealName}>Breakfast</span>
            <span className={styles.mealKcal}>450 kcal</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '80%', backgroundColor: '#10b981' }}></div>
          </div>
          <div className={styles.description}>
            Oats, Berries, Protein Shake
          </div>
        </div>
      </div>

      {/* Lunch */}
      <div className={styles.card}>
        <div className={styles.iconBox} style={{ color: '#10b981', backgroundColor: '#ecfdf5' }}>
          <i className="fa-solid fa-utensils"></i>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.cardHeader}>
            <span className={styles.mealName}>Lunch</span>
            <span className={styles.mealKcal}>620 kcal</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '90%', backgroundColor: '#10b981' }}></div>
          </div>
          <div className={styles.description}>
            Grilled Chicken Salad, Quinoa
          </div>
        </div>
      </div>

      {/* Dinner (Empty State) */}
      <div className={styles.card}>
        <div className={styles.iconBox} style={{ color: '#10b981', backgroundColor: '#ecfdf5' }}>
          <i className="fa-regular fa-moon"></i>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.cardHeader}>
            <span className={styles.mealName}>Dinner</span>
            <span className={styles.mealTargetKcal}>Target: 700 kcal</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '0%', backgroundColor: '#f3f4f6' }}></div>
          </div>
          <div className={styles.description}>
            <span className={styles.italic}>Not logged yet</span>
            <button className={styles.logButton}>Log Now</button>
          </div>
        </div>
      </div>

      {/* Snacks */}
      <div className={styles.card}>
        <div className={styles.iconBox} style={{ color: '#d97706', backgroundColor: '#fffbeb' }}>
          <i className="fa-solid fa-cookie"></i>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.cardHeader}>
            <span className={styles.mealName}>Snacks</span>
            <span className={styles.mealKcal} style={{ color: '#d97706' }}>350 kcal</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '60%', backgroundColor: '#b45309' }}></div>
          </div>
          <div className={styles.description}>
            Almonds, Apple
          </div>
        </div>
      </div>

    </div>
  );
};

export default MealPlan;
