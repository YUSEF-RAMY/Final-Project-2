import React from 'react';
import styles from './OnboardingSteps.module.css';


interface Step2ActivityProps {
  activity: string;
  setActivity: (value: string) => void;
  fitness: string;
  setFitness: (value: string) => void;
}

const Step2Activity: React.FC<Step2ActivityProps> = ({ activity, setActivity, fitness, setFitness }) => (

  <div className={styles['step-card']}>
    <h3 style={{ margin: 0 }}>Activity & Fitness Levels</h3>
    <div className={styles['card-body']}>
      <label style={{ display: 'block', marginTop: '10px', fontSize: '0.9rem', color: '#555', fontWeight: 'bold' }}>Activity Level (1-5)</label>
      <select
        id="activity"
        style={{ marginTop: '5px', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
        value={activity}
        onChange={(e) => setActivity(e.target.value)}
      >
        <option value="">Select Activity Level</option>
        <option value="1">1 - Sedentary</option>
        <option value="2">2 - Lightly Active</option>
        <option value="3">3 - Moderately Active</option>
        <option value="4">4 - Very Active</option>
        <option value="5">5 - Extra Active</option>
      </select>

      <label style={{ display: 'block', marginTop: '15px', fontSize: '0.9rem', color: '#555', fontWeight: 'bold' }}>Fitness Level (1-5)</label>
      <select
        id="fitness"
        style={{ marginTop: '5px', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
        value={fitness}
        onChange={(e) => setFitness(e.target.value)}
      >
        <option value="">Select Fitness Level</option>
        <option value="1">1 - Beginner</option>
        <option value="2">2 - Novice</option>
        <option value="3">3 - Intermediate</option>
        <option value="4">4 - Advanced</option>
        <option value="5">5 - Elite</option>
      </select>
    </div>
  </div>
);

export default Step2Activity;