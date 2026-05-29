import React, { useState, useEffect, useRef } from 'react';
import { fetchFoods, addFoodToMeal } from '../../../services/foodService';
import type { Food } from '../../../services/foodService';
import styles from './LogMealModal.module.css';

interface LogMealModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch',     label: 'Lunch'     },
  { value: 'dinner',    label: 'Dinner'    },
  { value: 'snacks',    label: 'Snacks'    },
];

const LogMealModal: React.FC<LogMealModalProps> = ({ onClose, onSuccess }) => {
  const [mealType,  setMealType]  = useState('breakfast');
  const [query,     setQuery]     = useState('');
  const [foods,     setFoods]     = useState<Food[]>([]);
  const [filtered,  setFiltered]  = useState<Food[]>([]);
  const [selected,  setSelected]  = useState<Food | null>(null);
  const [amount,    setAmount]    = useState<number>(100);
  const [loading,   setLoading]   = useState(false);
  const [submitting,setSubmitting]= useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Load food catalogue once.
  useEffect(() => {
    setLoading(true);
    fetchFoods()
      .then((list) => { setFoods(list); setFiltered(list); })
      .catch(() => setError('Could not load food list.'))
      .finally(() => setLoading(false));
  }, []);

  // Filter by search query.
  useEffect(() => {
    const q = query.toLowerCase().trim();
    setFiltered(q ? foods.filter((f) => f.name.toLowerCase().includes(q)) : foods);
  }, [query, foods]);

  // Close on backdrop click.
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      await addFoodToMeal(mealType, selected.id, amount);
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || 'Failed to log meal.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Estimated kcal for the selected food at the given amount.
  const estimatedKcal = selected
    ? Math.round((selected.nutrition.calories / 100) * amount)
    : 0;

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={handleBackdrop}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <i className="fa-solid fa-utensils" />
            </div>
            <div>
              <h2 className={styles.title}>Log a Meal</h2>
              <p className={styles.subtitle}>Search for a food and add it to your log</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Meal type selector */}
          <div className={styles.field}>
            <label className={styles.label}>Meal</label>
            <div className={styles.mealTabs}>
              {MEAL_TYPES.map((mt) => (
                <button
                  key={mt.value}
                  type="button"
                  className={`${styles.mealTab} ${mealType === mt.value ? styles.mealTabActive : ''}`}
                  onClick={() => setMealType(mt.value)}
                >
                  {mt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Food search */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="food-search">Food</label>
            <div className={styles.searchWrap}>
              <i className={`fa-solid fa-magnifying-glass ${styles.searchIcon}`} />
              <input
                id="food-search"
                type="text"
                className={styles.searchInput}
                placeholder="Search foods…"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
                autoComplete="off"
              />
            </div>

            {/* Results list */}
            {!selected && (
              <div className={styles.results}>
                {loading && (
                  <div className={styles.loadingRow}>
                    <i className="fa-solid fa-spinner fa-spin" /> Loading foods…
                  </div>
                )}
                {!loading && filtered.slice(0, 8).map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    className={styles.resultItem}
                    onClick={() => { setSelected(food); setQuery(food.name); }}
                  >
                    <span className={styles.foodName}>{food.name}</span>
                    <span className={styles.foodKcal}>
                      {food.nutrition.calories} kcal / 100g
                    </span>
                  </button>
                ))}
                {!loading && filtered.length === 0 && query && (
                  <div className={styles.noResults}>No foods found for "{query}"</div>
                )}
              </div>
            )}
          </div>

          {/* Amount */}
          {selected && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="food-amount">
                Amount (g)
              </label>
              <div className={styles.amountWrap}>
                <input
                  id="food-amount"
                  type="number"
                  className={styles.amountInput}
                  value={amount}
                  min={1}
                  max={2000}
                  onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                />
                <span className={styles.amountBadge}>≈ {estimatedKcal} kcal</span>
              </div>
            </div>
          )}

          {error && <p className={styles.error}><i className="fa-solid fa-circle-exclamation" /> {error}</p>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!selected || submitting}
          >
            {submitting ? (
              <><i className="fa-solid fa-spinner fa-spin" /> Logging…</>
            ) : (
              <><i className="fa-solid fa-plus" /> Log Meal</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogMealModal;
