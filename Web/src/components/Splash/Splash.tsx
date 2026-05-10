import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Splash.module.css'; // تأكدي من المسار

const Splash: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/login'), 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    /* لاحظي طريقة كتابة styles['class-name'] */
    <div className={styles['splash-container']}>
      {/* الدوائر الخلفية */}
      <div className={`${styles.shape} ${styles['circle-green']}`}></div>
      <div className={`${styles.shape} ${styles['circle-orange']}`}></div>

      <div className={styles.content}>
        <div className={styles['logo-box']}>
           {/* هنا حطي صورة اللوجو أو الأيقونة */}
           <img src="/logo.png" alt="logo" style={{width: '60px'}} /> 
        </div>

        <h1 className={styles['brand-name']}>Healthyfy</h1>
        <p className={styles.tagline}>Your AI Nutrition Coach</p>

        <div className={styles['loader-dots']}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default Splash;