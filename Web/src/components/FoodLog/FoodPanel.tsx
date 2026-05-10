import React, { useState } from 'react';
import type { Food } from '../../services/foodService';
import { addFoodToMeal } from '../../services/foodService';
import styles from './FoodPanel.module.css';

interface FoodPanelProps {
  food: Food;
  mealType: string;
  onClose: () => void;
  onSuccess: () => void;
}

const FoodPanel: React.FC<FoodPanelProps> = ({ food, mealType, onClose, onSuccess }) => {
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate nutrition per gram
  const parsedQuantity = quantity === '' ? 0 : quantity;
  const servingBase = parseFloat(food.nutrition.serving_size) || 100;
  const multiplier = parsedQuantity / servingBase;
  const dynCalories = Math.round(food.nutrition.calories * multiplier);
  const dynProtein = +(food.nutrition.protein * multiplier).toFixed(1);
  const dynCarbs = +(food.nutrition.carbs * multiplier).toFixed(1);
  const dynFat = +(food.nutrition.fat * multiplier).toFixed(1);

  // Max macro for bar width
  const maxMacro = Math.max(dynProtein, dynCarbs, dynFat, 1);

  const handleAdd = async () => {
    if (quantity === '' || quantity <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await addFoodToMeal(mealType, food.id, quantity);
      setSuccess(true);
      // Trigger success callback
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: unknown) {
      console.error('Add food error:', err);
      const message = err instanceof Error ? err.message : 'Failed to add food.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const mealLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelHeaderInfo}>
            <h2>Add to Log</h2>
            <p>{mealLabel}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className={styles.panelBody}>
          {success ? (
            <div className={styles.successState}>
              <i className="fa-solid fa-circle-check"></i>
              <h3>Added Successfully!</h3>
              <p>{food.name} added to {mealLabel}</p>
              <button className={styles.backButton} onClick={onClose}>
                Back to Foods
              </button>
            </div>
          ) : (
            <>
              {/* Info */}
              <div className={styles.foodImageContainer}>
                {food.image_url ? (
                  <img src={food.image_url} alt={food.name} className={styles.foodImage} />
                ) : (
                  <div className={styles.foodImagePlaceholder}>
                    <i className="fa-solid fa-bowl-food"></i>
                  </div>
                )}
                <div className={styles.foodMainInfo}>
                  <h3>{food.name}</h3>
                  <p>{food.nutrition.serving_size} serving</p>
                </div>
              </div>

              {/* Macros */}
              <div className={styles.nutritionBlock}>
                <div className={styles.caloriesRow}>
                  <span className={styles.caloriesNumber}>{dynCalories}</span>
                  <span className={styles.caloriesLabel}>CALORIES</span>
                </div>

                <div className={styles.macrosRow}>
                  <div className={styles.macroBar}>
                    <span className={styles.macroBarValue}>{dynProtein}g</span>
                    <div className={styles.macroBarTrack}>
                      <div
                        className={`${styles.macroBarFill} ${styles.macroBarFillProtein}`}
                        style={{ width: `${(dynProtein / maxMacro) * 100}%` }}
                      />
                    </div>
                    <span className={styles.macroBarLabel}>PRO</span>
                  </div>
                  <div className={styles.macroBar}>
                    <span className={styles.macroBarValue}>{dynCarbs}g</span>
                    <div className={styles.macroBarTrack}>
                      <div
                        className={`${styles.macroBarFill} ${styles.macroBarFillCarbs}`}
                        style={{ width: `${(dynCarbs / maxMacro) * 100}%` }}
                      />
                    </div>
                    <span className={styles.macroBarLabel}>CARB</span>
                  </div>
                  <div className={styles.macroBar}>
                    <span className={styles.macroBarValue}>{dynFat}g</span>
                    <div className={styles.macroBarTrack}>
                      <div
                        className={`${styles.macroBarFill} ${styles.macroBarFillFat}`}
                        style={{ width: `${(dynFat / maxMacro) * 100}%` }}
                      />
                    </div>
                    <span className={styles.macroBarLabel}>FAT</span>
                  </div>
                </div>
              </div>

              {/* Qty */}
              <div className={styles.quantitySection}>
                <div className={styles.quantityField}>
                  <label>Amount (grams)</label>
                  <input
                    type="number"
                    min={0}
                    value={quantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setQuantity('');
                      } else {
                        const num = Number(val);
                        if (num >= 0) setQuantity(num);
                      }
                    }}
                  />
                </div>
                <div className={styles.quantityField}>
                  <label>Unit</label>
                  <select defaultValue="g">
                    <option value="g">Grams (g)</option>
                  </select>
                </div>
              </div>

              {error && (
                <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>{error}</p>
              )}

              {/* Add */}
              <button className={styles.addButton} onClick={handleAdd} disabled={loading}>
                {loading ? (
                  <>Adding...</>
                ) : (
                  <>
                    <i className="fa-solid fa-circle-check"></i>
                    Add to {mealLabel}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default FoodPanel;
