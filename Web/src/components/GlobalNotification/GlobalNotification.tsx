import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import styles from './GlobalNotification.module.css';

const GlobalNotification: React.FC = () => {
  const { state, closeNotification } = useNotification();
  const navigate = useNavigate();

  // If we are idle and not visible, do not render to avoid blocking clicks
  if (state.status === 'idle' && !state.isVisible) return null;

  const handleClick = () => {
    if (state.status === 'done' && state.redirectUrl) {
      navigate(state.redirectUrl);
      closeNotification();
    }
  };

  return (
    <div 
      className={`${styles.notificationContainer} ${state.isVisible ? styles.visible : ''} ${state.redirectUrl && state.status === 'done' ? styles.clickable : ''}`}
      onClick={handleClick}
      role="alert"
    >
      <div className={styles.content}>
        {state.status === 'processing' && <div className={styles.spinner} />}
        {state.status === 'done' && (
          <div className={styles.checkmark}>
             <i className="fa-solid fa-circle-check"></i>
          </div>
        )}
        <span className={styles.text}>{state.message}</span>
      </div>
      
      <button 
        className={styles.closeButton} 
        onClick={(e) => {
          e.stopPropagation();
          closeNotification();
        }}
        aria-label="Close notification"
      >
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
};

export default GlobalNotification;
