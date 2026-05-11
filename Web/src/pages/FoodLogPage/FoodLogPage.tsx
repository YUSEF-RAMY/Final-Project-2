import React from 'react';
import styles from './FoodLogPage.module.css';
import Sidebar from '../../components/home/sidebar/Sidebar';
import FoodLogContent from '../../components/FoodLog/FoodLogContent';

const FoodLogPage: React.FC = () => (
  <div className={styles.pageLayout}>
    <Sidebar />
    <FoodLogContent />
  </div>
);

export default FoodLogPage;