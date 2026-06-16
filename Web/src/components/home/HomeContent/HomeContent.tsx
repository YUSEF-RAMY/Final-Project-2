import React from 'react';
import styles from '../../../pages/Home/Home.module.css';
import DailyEnergy from '../dialyenergy/DailyEnergy';
import Hydration from '../Hydration/Hydration';
import MealPlan from '../MealPlan/MealPlan';
import Insights from '../Insights/Insights';
import { useDailySummary } from '../../../hooks/useDailySummary';

const HomeContent: React.FC = () => {
  const { data, loading, error, refetch } = useDailySummary();

  if (loading) {
    return (
      <div className={styles.dashboardGrid}>
        <div className={styles.column}>
          <div className={styles.skeleton} style={{ height: '320px', borderRadius: '24px' }} />
          <div className={styles.skeleton} style={{ height: '200px', borderRadius: '24px' }} />
        </div>
        <div className={styles.column}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skeleton} style={{ height: '100px', borderRadius: '20px' }} />
          ))}
        </div>
        <div className={styles.column}>
          <div className={styles.skeleton} style={{ height: '400px', borderRadius: '20px' }} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.errorState}>
        <i className="fa-solid fa-triangle-exclamation" />
        <h3>Couldn't load your dashboard</h3>
        <p>{error || 'No data available.'}</p>
        <button onClick={refetch}>Try Again</button>
      </div>
    );
  }

  return (
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
        <MealPlan meals={data.meals} mealTargets={data.meal_targets} onRefetch={refetch} />
      </div>

      {/* Right col */}
      <div className={styles.column}>
        <Insights />
      </div>
    </div>
  );
};

export default HomeContent;
