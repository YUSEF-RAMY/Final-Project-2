import React, { useRef } from 'react';
import styles from './ForgotPassword.module.css';

interface Step2Props {
  otp: string[];
  setOtp: React.Dispatch<React.SetStateAction<string[]>>;
  timer: string;
  status: 'active' | 'completed' | 'waiting';
  onResend?: () => void;
}

const Step2: React.FC<Step2Props> = ({ otp, setOtp, status, timer, onResend }) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const getCardClass = () => {
    return `${styles.stepCard} ${styles[status]}`;
  };

  const handleChange = (value: string, index: number) => {
    if (value !== "" && isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className={getCardClass()}>

      <div className={styles.statusDot}>
        <span>
          {status === 'completed' ? <i className="fa-solid fa-check"></i> : '2'}
        </span>
      </div>


      <div className={styles.summaryContent}>
        <div>
          <p className={styles.stepLabel}>STEP 2</p>
          <p className={styles.summaryText}>Verification Successful</p>
        </div>
        <i className="fa-solid fa-circle-check" style={{ color: '#2ecc71', fontSize: '1.2rem' }}></i>
      </div>


      <div className={styles.fullContent}>
        <p className={styles.stepLabel}>STEP 2</p>
        <h3 className={styles.stepTitle}>Enter Security Code</h3>
        <p className={styles.stepDescription} style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>
          We've sent a 6-digit code to your email.
        </p>

        <div className={styles.otpGrid} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => { inputsRef.current[idx] = el; }}
              type="text"
              className={styles.otpInput}
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onFocus={(e) => e.target.select()}
              disabled={status !== 'active'}
              style={{
                width: '45px',
                height: '50px',
                textAlign: 'center',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                borderRadius: '10px',
                border: '1px solid #ddd'
              }}
            />
          ))}
        </div>

        <div className={styles.otpInfo} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <span className={styles.timerBox} style={{ color: '#666' }}>
            <i className="fa-regular fa-clock"></i> Expires in <b style={{ color: '#e74c3c' }}>{timer}</b>
          </span>
          <span
            className={styles.resendLink}
            onClick={() => onResend?.()}
            style={{ color: '#1a7a44', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Resend Code
          </span>
        </div>
      </div>
    </div>
  );
};

export default Step2;