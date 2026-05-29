import React from 'react';
import Sidebar from '../../components/home/sidebar/Sidebar';
import PlanContent from '../../components/plan/PlanContent/PlanContent';
import styles from './PlanPage.module.css';

const PlanPage: React.FC = () => (
  <div className={styles.planLayout}>
    <Sidebar />
    <div className={styles.mainContent}>
      <div className={styles.scrollableContent}>
        <PlanContent />
      </div>
    </div>
  </div>
);

export default PlanPage;
