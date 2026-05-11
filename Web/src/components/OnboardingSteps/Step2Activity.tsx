import React from 'react';
import styles from './OnboardingSteps.module.css';


interface Step2ActivityProps {
  activity: string;
  setActivity: (value: string) => void;
}

const Step2Activity: React.FC<Step2ActivityProps> = ({ activity, setActivity }) => (

  <div className={styles['step-card']}>
    <h3 style={{ margin: 0 }}>Activity Level</h3>
    <div className={styles['card-body']}>
      <select
        id="activity"
        style={{ marginTop: '10px' }}
        value={activity}
        onChange={(e) => setActivity(e.target.value)}

      >
        <option value="">Select Level</option>
        <option value="sedentary">sedentary</option>
        <option value="lightly_active">lightly active</option>
        <option value="moderately_active">moderately active</option>
        <option value="very_active">very active</option>
      </select>
    </div>
  </div>
);

export default Step2Activity;