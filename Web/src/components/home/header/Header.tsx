import React from 'react';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <h2 className={styles.greeting}>Hello, User!</h2>
      <div className={styles.actions}>
        <button className={styles.iconButton}>
          <i className="fa-regular fa-bell"></i>
          <span className={styles.notificationBadge}></span>
        </button>
        <button className={styles.iconButton}>
          <i className="fa-solid fa-gear"></i>
        </button>
        <button className={styles.profileButton}>
          <i className="fa-solid fa-user"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
