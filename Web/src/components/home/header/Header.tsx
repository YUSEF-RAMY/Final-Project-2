import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProfile } from '../../../services/profileService';
import NotificationPanel from '../NotificationPanel/NotificationPanel';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('User');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch profile once on mount
  useEffect(() => {
    let cancelled = false;
    fetchProfile()
      .then((profile) => {
        if (cancelled) return;
        const firstName = profile.name?.split(' ')[0] || 'User';
        setName(firstName);
        
        let imageUrl = profile.profile_image;
        if (imageUrl) {
          const apiBase = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '');
          if (!imageUrl.startsWith('http')) {
            imageUrl = `${apiBase}/${imageUrl.replace(/^\//, '')}`;
          } else if (imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1')) {
            // Backend might return localhost URL while accessed via ngrok
            try {
              const urlObj = new URL(imageUrl);
              imageUrl = `${apiBase}${urlObj.pathname}${urlObj.search}`;
            } catch (e) {
              // Ignore invalid URL
            }
          }
        }
        setProfileImage(imageUrl || null);
      })
      .catch((err) => {
        if (err?.message === 'UNAUTHORIZED') navigate('/login');
        console.warn('Profile fetch error:', err);
      });
    return () => { cancelled = true; };
  }, [navigate]);

  const handleUnreadChange = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);

  return (
    <>
      <header className={styles.header}>
        <h2 className={styles.greeting}>Hello, {name}!</h2>
        <div className={styles.actions}>
          {/* Bell — opens notification panel */}
          <button
            className={styles.iconButton}
            onClick={() => setNotifOpen(true)}
            id="notification-bell"
          >
            <i className="fa-regular fa-bell"></i>
            {unreadCount > 0 && <span className={styles.notificationBadge}>{unreadCount}</span>}
          </button>

          {/* Settings — navigates to profile */}
          <button
            className={styles.iconButton}
            onClick={() => navigate('/profile')}
            id="settings-button"
          >
            <i className="fa-solid fa-gear"></i>
          </button>

          {/* Profile avatar */}
          <button className={styles.profileButton} onClick={() => navigate('/profile')} id="profile-avatar">
            {profileImage ? (
              <img src={profileImage} alt="Avatar" className={styles.profileImg} />
            ) : (
              <i className="fa-solid fa-user"></i>
            )}
          </button>
        </div>
      </header>

      <NotificationPanel
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        onUnreadCountChange={handleUnreadChange}
      />
    </>
  );
};

export default Header;
