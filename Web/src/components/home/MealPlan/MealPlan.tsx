import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Meal } from '../../../services/dailySummaryService';
import styles from './MealPlan.module.css';

interface MealPlanProps {
  meals: Meal[];
}

const MEAL_ORDER: Array<'breakfast' | 'lunch' | 'dinner' | 'snacks'> = [
  'breakfast',
  'lunch',
  'dinner',
  'snacks',
];

const MEAL_CONFIG = {
  breakfast: {
    icon: 'fa-regular fa-sun',
    color: '#10b981',
    bg: '#ecfdf5',
    label: 'Breakfast',
  },
  lunch: {
    icon: 'fa-solid fa-utensils',
    color: '#10b981',
    bg: '#ecfdf5',
    label: 'Lunch',
  },
  dinner: {
    icon: 'fa-regular fa-moon',
    color: '#6366f1',
    bg: '#eef2ff',
    label: 'Dinner',
  },
  snacks: {
    icon: 'fa-solid fa-cookie-bite',
    color: '#d97706',
    bg: '#fffbeb',
    label: 'Snacks',
  },
};

const MealPlan: React.FC<MealPlanProps> = ({ meals }) => {
  const navigate = useNavigate();

  // Build a map of meal type -> meal data for easy lookup
  const mealMap = React.useMemo(() => {
    const map: Partial<Record<string, Meal>> = {};
    meals.forEach((m) => {
      map[m.type] = m;
    });
    return map;
  }, [meals]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Today's Blueprint</h3>
        <p className={styles.subtitle}>Your structured metabolic intake.</p>
      </div>

      {MEAL_ORDER.map((mealType) => {
        const meal = mealMap[mealType];
        const config = MEAL_CONFIG[mealType];

        // If no meal data yet from API, show empty state
        if (!meal) {
          return (
            <div className={styles.card} key={mealType}>
              <div className={styles.iconBox} style={{ color: config.color, backgroundColor: config.bg }}>
                <i className={config.icon}></i>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <span className={styles.mealName}>{config.label}</span>
                  <span className={styles.mealTargetKcal}>— kcal</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '0%', backgroundColor: config.color }} />
                </div>
                <div className={styles.description}>
                  <span className={styles.italic}>Not logged yet</span>
                  <button
                    className={styles.logButton}
                    style={{ backgroundColor: config.color }}
                    onClick={() => navigate(`/food-log?meal=${mealType}`)}
                  >
                    Log Now
                  </button>
                </div>
              </div>
            </div>
          );
        }

        const { metrics, items } = meal;
        const consumed = metrics.consumed_calories || 0;
        const target = metrics.target_calories || 1;
        const progressPct = Math.min((consumed / target) * 100, 100);
        const isEmpty = items.length === 0;

        return (
          <div className={styles.card} key={mealType}>
            <div className={styles.iconBox} style={{ color: config.color, backgroundColor: config.bg }}>
              <i className={config.icon}></i>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.cardHeader}>
                <span className={styles.mealName}>{config.label}</span>
                {isEmpty ? (
                  <span className={styles.mealTargetKcal}>Target: {Math.round(target)} kcal</span>
                ) : (
                  <span className={styles.mealKcal} style={{ color: config.color }}>
                    {Math.round(consumed)} kcal
                  </span>
                )}
              </div>

              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progressPct}%`, backgroundColor: config.color }}
                />
              </div>

              {isEmpty ? (
                <div className={styles.description}>
                  <span className={styles.italic}>No meal logged yet</span>
                  <button
                    className={styles.logButton}
                    style={{ backgroundColor: config.color }}
                    onClick={() => navigate(`/food-log?meal=${mealType}`)}
                  >
                    Log Now
                  </button>
                </div>
              ) : (
                <div className={styles.itemsList}>
                  {items.slice(0, 2).map((item, idx) => (
                    <div className={styles.itemRow} key={idx}>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className={styles.itemImage} />
                      ) : (
                        <div className={styles.itemImagePlaceholder} style={{ backgroundColor: config.bg }}>
                          <i className={config.icon} style={{ color: config.color, fontSize: '12px' }}></i>
                        </div>
                      )}
                      <div className={styles.itemInfo}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemMacros}>
                          {Math.round(item.calories)} kcal · {Math.round(item.protein)}g protein
                        </span>
                      </div>
                    </div>
                  ))}
                  {items.length > 2 && (
                    <button
                      className={styles.viewMoreBtn}
                      onClick={() => navigate(`/food-log?meal=${mealType}`)}
                    >
                      +{items.length - 2} more
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MealPlan;
