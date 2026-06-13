import React from 'react';
import styles from './OnboardingSteps.module.css';


type GoalType = 'lose_fat' | 'gain_muscle' | 'maintain' | '';

interface Step3GoalProps {
  selectedGoal: string;
  selectGoal: (goal: GoalType) => void;
}

const Step3Goal: React.FC<Step3GoalProps> = ({ selectGoal, selectedGoal }) => (
  <div className={styles['step-card']}>
    <h3 style={{ margin: 0 }}>Primary Objective</h3>
    <div className={styles['card-body']}>
      <div className={styles['obj-grid']}>

        {/* Lose Weight Card */}
        <div
          className={`${styles['obj-card']} ${selectedGoal === 'lose_fat' ? styles.selected : ''}`}
          onClick={() => selectGoal('lose_fat')}
        >
          <i className="fa-solid fa-fire"></i><br />
          <h4>lose fat</h4>
        </div>

        {/* Build Muscle Card */}
        <div
          className={`${styles['obj-card']} ${selectedGoal === 'gain_muscle' ? styles.selected : ''}`}
          onClick={() => selectGoal('gain_muscle')}
        >
          <i className="fa-solid fa-dumbbell"></i><br />
          <h4>gain muscle</h4>
        </div>

        {/* Maintain Card */}
        <div
          className={`${styles['obj-card']} ${selectedGoal === 'maintain' ? styles.selected : ''}`}
          onClick={() => selectGoal('maintain')}
        >
          <i className="fa-solid fa-heart"></i><br />
          <h4>maintain</h4>
        </div>

      </div>
    </div>
  </div>
);

export default Step3Goal;