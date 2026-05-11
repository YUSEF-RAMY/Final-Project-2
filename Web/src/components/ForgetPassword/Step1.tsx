import React from 'react';
import styles from './ForgotPassword.module.css';

interface Step1Props {
  email: string;
  setEmail: (val: string) => void;
  status: 'active' | 'completed' | 'waiting';
  onEdit: () => void;
}

const Step1: React.FC<Step1Props> = ({ email, setEmail, status, onEdit }) => {

  const getCardClass = () => {
    return `${styles.stepCard} ${styles[status]}`;
  };

  const isEmailInvalid = email.length > 0 && !/\S+@\S+\.\S+/.test(email);

  return (
    <div className={getCardClass()}>

      <div className={styles.statusDot}>
        <span>
          {status === 'completed' ? <i className="fa-solid fa-check"></i> : '1'}
        </span>
      </div>


      <div className={styles.summaryContent}>
        <div>
          <p className={styles.stepLabel}>STEP 1</p>
          <p className={styles.summaryText}>{email || "No email provided"}</p>
        </div>
        <span className={styles.editBtn} onClick={onEdit} style={{ cursor: 'pointer', color: '#2ecc71', fontWeight: 'bold' }}>
          Edit
        </span>
      </div>


      <div className={styles.fullContent}>
        <p className={styles.stepLabel}>STEP 1</p>
        <h3 className={styles.stepTitle}>Enter your email</h3>
        <input
          type="email"
          className={styles.inputField}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="alex.vitality@example.com"
          disabled={status !== 'active'}
        />

        {isEmailInvalid && (
          <p className={styles.errHint} style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '8px' }}>
            <i className="fa-solid fa-circle-exclamation"></i> Please enter a valid email.
          </p>
        )}
      </div>


    </div>
  );
};

export default Step1;