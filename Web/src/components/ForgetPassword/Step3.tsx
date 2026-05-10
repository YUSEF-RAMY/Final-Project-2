import React, { useState } from 'react';
import styles from './ForgotPassword.module.css';

interface Step3Props {
  passwords: { p1: string; p2: string };
  setPasswords: React.Dispatch<React.SetStateAction<{ p1: string; p2: string }>>;
  status: 'active' | 'completed' | 'waiting';
}

const Step3: React.FC<Step3Props> = ({ passwords, setPasswords, status }) => {
  const [showPass, setShowPass] = useState(false);

  const getCardClass = () => {
    return `${styles.stepCard} ${styles[status]}`;
  };

  const isError = 
    (passwords.p1.length > 0 || passwords.p2.length > 0) && 
    (passwords.p1.length < 8 || passwords.p1 !== passwords.p2);

  return (
    <div className={getCardClass()}>
      {/* 1. الدائرة اللي على الخط - رقم 3 */}
      <div className={styles.statusDot}>
        <span>
          {status === 'completed' ? <i className="fa-solid fa-check"></i> : '3'}
        </span>
      </div>
      
      {/* 2. محتوى الـ Summary (يظهر فقط لما العملية تنجح) */}
      <div className={styles.summaryContent}>
        <div>
          <p className={styles.stepLabel}>STEP 3</p>
          <p className={styles.summaryText} style={{ color: '#2ecc71', fontWeight: 'bold' }}>
            Password Updated Successfully
          </p>
        </div>
        <i className="fa-solid fa-circle-check" style={{ color: '#2ecc71', fontSize: '1.2rem' }}></i>
      </div>

      {/* 3. المحتوى الكامل (يظهر لما تكون الخطوة active) */}
      <div className={styles.fullContent}>
        <p className={styles.stepLabel}>FINAL STEP</p>
        <h3 className={styles.stepTitle}>Create New Password</h3>
        
        {/* حقل الباسورد الأول */}
        <div className={styles.inputWrapper} style={{ position: 'relative', marginBottom: '15px' }}>
          <input
            type={showPass ? "text" : "password"}
            className={styles.inputField}
            placeholder="New Password"
            value={passwords.p1}
            onChange={(e) => setPasswords({ ...passwords, p1: e.target.value })}
            disabled={status !== 'active'}
            style={{ width: '100%', paddingRight: '40px' }}
          />
          <i 
            className={`fa-solid ${showPass ? 'fa-eye-slash' : 'fa-eye'} ${styles.passwordIcon}`}
            onClick={() => setShowPass(!showPass)}
            style={{
              position: 'absolute',
              right: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              color: '#999'
            }}
          />
        </div>

        {/* حقل تأكيد الباسورد */}
        <div className={styles.inputWrapper}>
          <input
            type={showPass ? "text" : "password"}
            className={styles.inputField}
            placeholder="Confirm Password"
            value={passwords.p2}
            onChange={(e) => setPasswords({ ...passwords, p2: e.target.value })}
            disabled={status !== 'active'}
            style={{ width: '100%' }}
          />
        </div>
        
        {isError && (
          <p className={styles.errHint} style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '10px' }}>
            <i className="fa-solid fa-circle-exclamation"></i> Passwords must match and be 8+ chars.
          </p>
        )}
      </div>
    </div>
  );
};

export default Step3;