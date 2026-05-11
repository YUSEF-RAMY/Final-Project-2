import React from 'react';
import styles from './OnboardingSteps.module.css';


interface Step4FinalProps {
  medical: string;
  setMedical: (value: string) => void;
}

const Step4Final: React.FC<Step4FinalProps> = ({ medical, setMedical }) => (

  <div className={styles['step-card']}>
    <h3 style={{ margin: 0 }}>Final Details</h3>
    <div className={styles['card-body']}>
      <input
        type="text"

        placeholder="Any medical conditions? (Optional)"
        value={medical}
        onChange={(e) => setMedical(e.target.value)}
      />
    </div>
  </div>
);

export default Step4Final;