import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoCircle}>
          Hfy
        </div>
        <div className={styles.logoText}>
          <h1>Healthify</h1>
          <p>AI Nutrition</p>
        </div>
      </div>

      <nav className={styles.nav}>
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <i className="fa-solid fa-border-all"></i>
          Dashboard
        </NavLink>

        <NavLink 
          to="/analytics" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <i className="fa-solid fa-chart-simple"></i>
          Analytics
        </NavLink>
        <NavLink 
          to="/profile" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <i className="fa-regular fa-user"></i>
          Profile
        </NavLink>
      </nav>

      <div className={styles.bottomAction}>
        <button className={styles.logButton}>
          <i className="fa-solid fa-plus"></i>
          Log Meal
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
