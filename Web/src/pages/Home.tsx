import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import Sidebar from '../components/home/sidebar/Sidebar';
import Header from '../components/home/header/Header';
import DailyEnergy from '../components/home/dialyenergy/DailyEnergy';
import Hydration from '../components/home/Hydration/Hydration';
import MealPlan from '../components/home/MealPlan/MealPlan';
import Insights from '../components/home/Insights/Insights';
import { useDailySummary } from '../hooks/useDailySummary';
import GlobalNotification from '../components/GlobalNotification/GlobalNotification';

const Home: React.FC = () => {
  const { data, loading, error, refetch } = useDailySummary();
  const navigate = useNavigate();

  return (
    <div className={styles.dashboardLayout}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Header />
        <GlobalNotification />
        <div className={styles.scrollableContent}>
          {loading ? (
            <div className={styles.dashboardGrid}>
              {/* Loading skeleton */}
              <div className={styles.column}>
                <div className={styles.skeleton} style={{ height: '320px', borderRadius: '24px' }} />
                <div className={styles.skeleton} style={{ height: '200px', borderRadius: '24px' }} />
              </div>
              <div className={styles.column}>
                <div className={styles.skeleton} style={{ height: '100px', borderRadius: '20px' }} />
                <div className={styles.skeleton} style={{ height: '100px', borderRadius: '20px' }} />
                <div className={styles.skeleton} style={{ height: '100px', borderRadius: '20px' }} />
                <div className={styles.skeleton} style={{ height: '100px', borderRadius: '20px' }} />
              </div>
              <div className={styles.column}>
                <div className={styles.skeleton} style={{ height: '400px', borderRadius: '20px' }} />
              </div>
            </div>
          ) : error || !data ? (
            <div className={styles.errorState}>
              <i className="fa-solid fa-triangle-exclamation"></i>
              <h3>Couldn't load your dashboard</h3>
              <p>{error || 'No data available.'}</p>
              <button onClick={refetch}>Try Again</button>
            </div>
          ) : (
            <div className={styles.dashboardGrid}>
              {/* Left col */}
              <div className={styles.column}>
                <DailyEnergy
                  remainingData={data.overview.remaining}
                  consumedData={data.overview.consumed}
                  targetData={data.overview.target}
                />
                <Hydration targetData={data.overview.target} />
              </div>

              {/* Mid col */}
              <div className={styles.column}>
                <MealPlan meals={data.meals} />
              </div>

              {/* Right col */}
              <div className={styles.column}>
                <Insights />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
