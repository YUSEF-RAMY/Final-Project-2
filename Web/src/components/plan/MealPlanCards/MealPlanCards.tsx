import React from 'react';
import type { DailySummaryData } from '../../../services/dailySummaryService';
import styles from './MealPlanCards.module.css';

type MealTargets = DailySummaryData['meal_targets'];

interface MealPlanCardsProps {
  mealTargets: MealTargets;
}

const MEAL_CONFIG = [
  {
    key: 'breakfast' as const,
    label: 'Breakfast',
    time: '08:00 AM – 09:30 AM',
    icon: 'fa-solid fa-sun',
    iconColor: '#f59e0b',
    iconBg: '#fffbeb',
    isActive: true,
  },
  {
    key: 'lunch' as const,
    label: 'Lunch',
    time: '12:30 PM – 02:00 PM',
    icon: 'fa-regular fa-sun',
    iconColor: '#10b981',
    iconBg: '#ecfdf5',
    isActive: false,
  },
  {
    key: 'dinner' as const,
    label: 'Dinner',
    time: '07:00 PM – 08:30 PM',
    icon: 'fa-solid fa-cloud-moon',
    iconColor: '#6366f1',
    iconBg: '#eef2ff',
    isActive: false,
  },
  {
    key: 'snacks' as const,
    label: 'Snacks',
    time: 'Flexible timing',
    icon: 'fa-regular fa-clock',
    iconColor: '#9ca3af',
    iconBg: '#f3f4f6',
    isActive: false,
  },
] as const;

// Converts a macro value to a 0-100 percentage relative to a max cap.
function macroPercent(value: number, cap: number): number {
  return Math.min(Math.round((value / cap) * 100), 100);
}

const MealPlanCards: React.FC<MealPlanCardsProps> = ({ mealTargets }) => {
  return (
    <div className={styles.list}>
      {MEAL_CONFIG.map((cfg) => {
        const target = mealTargets[cfg.key];
        const calories = Math.round(target?.calories ?? 0);
        const protein  = Math.round(target?.protein  ?? 0);
        const carbs    = Math.round(target?.carbs    ?? 0);
        const fat      = Math.round(target?.fat      ?? 0);

        // Progress bar widths relative to reasonable daily maxima.
        const proteinPct = macroPercent(protein, 60);
        const carbsPct   = macroPercent(carbs,   100);
        const fatPct     = macroPercent(fat,      40);

        return (
          <div
            key={cfg.key}
            className={`${styles.card} ${cfg.isActive ? styles.activeCard : ''}`}
          >
            {/* Left: icon + name + time */}
            <div className={styles.left}>
              <div className={styles.iconWrap} style={{ background: cfg.iconBg }}>
                <i className={cfg.icon} style={{ color: cfg.iconColor }} />
              </div>
              <div className={styles.mealMeta}>
                <span className={styles.mealName}>{cfg.label}</span>
                <span className={styles.mealTime}>{cfg.time}</span>
              </div>
            </div>

            {/* Centre: target calories */}
            <div className={styles.center}>
              <span className={styles.targetLabel}>TARGET</span>
              <div className={styles.calorieRow}>
                <span className={styles.calorieNum}>{calories}</span>
                <span className={styles.calorieUnit}>kcal</span>
              </div>
            </div>

            {/* Right: macros */}
            <div className={styles.macros}>
              {/* Protein */}
              <div className={styles.macroRow}>
                <span className={styles.macroName}>Protein</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${proteinPct}%`, backgroundColor: '#10b981' }}
                  />
                </div>
                <span className={styles.macroVal} style={{ color: '#10b981' }}>
                  {protein}g
                </span>
              </div>

              {/* Carbs */}
              <div className={styles.macroRow}>
                <span className={styles.macroName}>Carbs</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${carbsPct}%`, backgroundColor: '#f97316' }}
                  />
                </div>
                <span className={styles.macroVal} style={{ color: '#f97316' }}>
                  {carbs}g
                </span>
              </div>

              {/* Fats */}
              <div className={styles.macroRow}>
                <span className={styles.macroName}>Fats</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${fatPct}%`, backgroundColor: '#10b981' }}
                  />
                </div>
                <span className={styles.macroVal} style={{ color: '#6b7280' }}>
                  {fat}g
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MealPlanCards;
