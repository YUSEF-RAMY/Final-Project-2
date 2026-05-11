import React from 'react';

import styles from './ForgotPassword.module.css';

const LeftPanel: React.FC = () => {
  return (
    <div className={styles.leftSide}>
      <div className={styles.leftLogo}>
        <i className="fa-solid fa-leaf"></i> Healthyfy
      </div>
      <div className={styles.heroText}>
        <h1>Restore your<br />connection.</h1>
        <p style={{ opacity: 0.8, maxWidth: '400px' }}>
          Securely regain access to your personalized AI nutrition insights.
        </p>
      </div>
    </div>
  );
};

export default LeftPanel;