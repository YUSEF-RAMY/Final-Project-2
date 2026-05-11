import React from 'react';
import Sidebar from '../../components/home/sidebar/Sidebar';
import Header from '../../components/home/header/Header';
import ProfileContent from '../../components/profile/ProfileContent';
import styles from './Home.module.css'; // reuse the same layout shell

const ProfilePage: React.FC = () => {
  return (
    <div className={styles.dashboardLayout}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Header />
        <div className={styles.scrollableContent}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
              Your Profile
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
              Manage your personal data, goals, and app preferences.
            </p>
          </div>
          <ProfileContent />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
