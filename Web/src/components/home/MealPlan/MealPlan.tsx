import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Meal, MacroData } from '../../../services/dailySummaryService';
import { deleteFoodItem } from '../../../services/foodService';
import styles from './MealPlan.module.css';

interface MealPlanProps {
  meals: Meal[];
  mealTargets?: Record<string, MacroData>;
  onRefetch?: () => void;
}

const MEAL_ORDER: Array<'breakfast' | 'lunch' | 'dinner' | 'snacks'> = [
  'breakfast',
  'lunch',
  'dinner',
  'snacks',
];

const MEAL_CONFIG = {
  breakfast: { icon: 'fa-regular fa-sun',       color: '#10b981', bg: '#ecfdf5', label: 'Breakfast' },
  lunch:     { icon: 'fa-solid fa-utensils',    color: '#10b981', bg: '#ecfdf5', label: 'Lunch'     },
  dinner:    { icon: 'fa-regular fa-moon',      color: '#6366f1', bg: '#eef2ff', label: 'Dinner'    },
  snacks:    { icon: 'fa-solid fa-cookie-bite', color: '#d97706', bg: '#fffbeb', label: 'Snacks'    },
};

const MealPlan: React.FC<MealPlanProps> = ({ meals, mealTargets, onRefetch }) => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const mealMap = React.useMemo(() => {
    const map: Partial<Record<string, Meal>> = {};
    meals.forEach((m) => { map[m.type] = m; });
    return map;
  }, [meals]);

  const handleDelete = async (itemId: number) => {
    if (deletingId !== null) return; // prevent double-click
    setDeletingId(itemId);
    try {
      await deleteFoodItem(itemId);
      onRefetch?.();
    } catch (err) {
      console.error('Delete food error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Today's Blueprint</h3>
        <p className={styles.subtitle}>Your structured metabolic intake.</p>
      </div>

      {MEAL_ORDER.map((mealType) => {
        const meal   = mealMap[mealType];
        const config = MEAL_CONFIG[mealType];

        /* ── Empty state: meal not returned by API yet ── */
        if (!meal) {
          const targetKcal = mealTargets?.[mealType]?.calories ? Math.round(mealTargets[mealType].calories) : null;
          return (
            <div className={styles.card} key={mealType}>
              <div className={styles.iconBox} style={{ color: config.color, backgroundColor: config.bg }}>
                <i className={config.icon}></i>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <span className={styles.mealName}>{config.label}</span>
                  <span className={styles.mealTargetKcal}>
                    {targetKcal ? `Target: ${targetKcal} kcal` : '— kcal'}
                  </span>
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
        const consumed    = metrics.consumed_calories || 0;
        const target      = metrics.target_calories || mealTargets?.[mealType]?.calories || 1;
        const progressPct = Math.min((consumed / target) * 100, 100);
        const isEmpty     = items.length === 0;

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
                    {Math.round(consumed)} / {Math.round(target)} kcal
                  </span>
                )}
              </div>

              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progressPct}%`, backgroundColor: config.color }} />
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
                  {items.slice(0, 3).map((item, idx) => {
                    const kcal  = Math.round(item.total_nutrition?.calories ?? 0);
                    const prot  = Math.round(item.total_nutrition?.protein  ?? 0);
                    const carbs = Math.round(item.total_nutrition?.carbs    ?? 0);
                    const fat   = Math.round(item.total_nutrition?.fat      ?? 0);
                    
                    // Priority 1: the log entry ID (entries[0].id)
                    // Priority 2: item.id (if backend attaches it directly)
                    // Priority 3: food_id (fallback)
                    const entryId = item.entries?.[0]?.id || item.id || item.food_id;
                    const isDeleting = deletingId === entryId;

                    return (
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
                            {kcal} kcal &bull; {prot}g protein &bull; {carbs}g carbs &bull; {fat}g fat
                          </span>
                        </div>
                        {/* Delete button */}
                        {entryId && (
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(entryId)}
                            disabled={isDeleting}
                            title={`Remove ${item.name}`}
                          >
                            {isDeleting ? (
                              <i className="fa-solid fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fa-solid fa-trash-can"></i>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    {items.length > 3 && (
                      <button
                        className={styles.viewMoreBtn}
                        onClick={() => navigate(`/food-log?meal=${mealType}`)}
                      >
                        +{items.length - 3} more
                      </button>
                    )}

                    {consumed < target && (
                      <button
                        className={styles.addMoreBtn}
                        style={{ color: config.color }}
                        onClick={() => navigate(`/food-log?meal=${mealType}`)}
                      >
                        <i className="fa-solid fa-plus"></i> Add item
                      </button>
                    )}
                  </div>
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
