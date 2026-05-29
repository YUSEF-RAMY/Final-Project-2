import React from 'react';
import Sidebar from '../../components/home/sidebar/Sidebar';
import Header  from '../../components/home/header/Header';
import AnalyticsContent from '../../components/analytics/AnalyticsContent/AnalyticsContent';
import styles from './AnalyticsPage.module.css';

const AnalyticsPage: React.FC = () => (
  <div className={styles.layout}>
    <Sidebar />
    <div className={styles.mainContent}>
      <Header />
      <div className={styles.scrollable}>
        <AnalyticsContent />
      </div>
    </div>
  </div>
);

export default AnalyticsPage;
