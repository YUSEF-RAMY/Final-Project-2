import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { fetchProfile } from '../../../services/profileService';
import { resolveImageUrl } from '../../../services/api';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchProfile()
      .then((profile) => {
        if (cancelled) return;
        setUserName(profile.name || 'User');
        setProfileImage(resolveImageUrl(profile.profile_image));
      })
      .catch(() => { /* silently ignore */ });
    return () => { cancelled = true; };
  }, []);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoCircle}>
          Hfy
        </div>
        <div className={styles.logoText}>
          <h1>Healthyfy</h1>
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
          to="/plan"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <i className="fa-solid fa-calendar-check"></i>
          Plan
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

      {/* User info section above the Log Meal button */}
      {userName && (
        <div className={styles.userSection}>
          <button className={styles.userButton} onClick={() => navigate('/profile')}>
            {profileImage ? (
              <img src={profileImage} alt="Avatar" className={styles.userAvatar} />
            ) : (
              <div className={styles.userAvatarPlaceholder}>
                <i className="fa-solid fa-user"></i>
              </div>
            )}
            <span className={styles.userName}>{userName}</span>
          </button>
        </div>
      )}

      <div className={styles.bottomAction}>
        <button className={styles.logButton} onClick={() => navigate('/food-log?meal=breakfast')}>
          <i className="fa-solid fa-plus"></i>
          Log Meal
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
