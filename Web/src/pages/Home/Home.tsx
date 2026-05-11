import React from 'react';
import styles from './Home.module.css';
import Sidebar from '../../components/home/sidebar/Sidebar';
import Header from '../../components/home/header/Header';
import HomeContent from '../../components/home/HomeContent/HomeContent';

const Home: React.FC = () => (
  <div className={styles.dashboardLayout}>
    <Sidebar />
    <div className={styles.mainContent}>
      <Header />
      <div className={styles.scrollableContent}>
        <HomeContent />
      </div>
    </div>
  </div>
);

export default Home;
