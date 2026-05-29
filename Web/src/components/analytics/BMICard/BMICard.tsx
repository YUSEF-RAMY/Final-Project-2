import React from 'react';
import styles from './BMICard.module.css';

interface BMICardProps {
  bmi: number;
}

function bmiCategory(bmi: number): { label: string; cls: string } {
  if (bmi < 18.5) return { label: 'Underweight', cls: styles.statusBlue   };
  if (bmi < 25)   return { label: 'Healthy',     cls: styles.statusGreen  };
  if (bmi < 30)   return { label: 'Overweight',  cls: styles.statusOrange };
  return                 { label: 'Obese',        cls: styles.statusRed    };
}

// Map BMI 15–35 to a 0–100 percentage on the gauge bar
function bmiPercent(bmi: number): number {
  return Math.min(Math.max(((bmi - 15) / 20) * 100, 2), 98);
}

const BMICard: React.FC<BMICardProps> = ({ bmi }) => {
  const { label, cls } = bmiCategory(bmi);
  const pct = bmiPercent(bmi);

  return (
    <div className={styles.card}>
      <p className={styles.label}>Current BMI</p>
      <p className={styles.range}>Optimal Range: 18.5 – 24.9</p>

      <div className={styles.bmiValue}>{bmi > 0 ? bmi.toFixed(1) : '—'}</div>

      <span className={`${styles.status} ${cls}`}>{label}</span>

      {/* Gradient gauge bar */}
      <div className={styles.gaugeWrap}>
        <div className={styles.gaugeTrack}>
          <div className={styles.gaugeDot} style={{ left: `${pct}%` }} />
        </div>
        <div className={styles.gaugeLabels}>
          <span>Under</span>
          <span>Normal</span>
          <span>Over</span>
        </div>
      </div>
    </div>
  );
};

export default BMICard;
