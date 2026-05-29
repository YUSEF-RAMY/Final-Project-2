import React from 'react';
import type { AIInsight } from '../../../utils/aiAnalysis';
import styles from './AIAnalysisCard.module.css';

interface AIAnalysisCardProps {
  insight: AIInsight;
}

const ICONS = {
  positive: 'fa-solid fa-leaf',
  warning:  'fa-solid fa-triangle-exclamation',
  info:     'fa-solid fa-circle-info',
};

const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({ insight }) => {
  return (
    <div className={`${styles.card} ${styles[insight.type]}`}>
      <div className={styles.header}>
        <div className={`${styles.iconWrap} ${styles[`icon_${insight.type}`]}`}>
          <i className={ICONS[insight.type]} />
        </div>
        <span className={styles.label}>AI Analysis</span>
      </div>

      <p className={styles.body}>{insight.body}</p>

      <div className={styles.tags}>
        {insight.tags.map((tag) => (
          <span key={tag} className={styles.tag}>{tag}</span>
        ))}
      </div>
    </div>
  );
};

export default AIAnalysisCard;
