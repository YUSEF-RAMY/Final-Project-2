import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CategoryTabs from './CategoryTabs';
import FoodGrid from './FoodGrid';
import FoodPanel from './FoodPanel';
import { useFoods } from '../../hooks/useFoods';
import type { Food } from '../../services/foodService';
import styles from './FoodLogContent.module.css';

const FoodLogContent: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mealType = searchParams.get('meal') || 'breakfast';

  const { foods, categories, loading, error, refetch } = useFoods();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedFood, setSelectedFood]     = useState<Food | null>(null);

  const filteredFoods = useMemo(() => {
    let result = foods;
    if (activeCategory !== 'All') result = result.filter((f) => f.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [foods, activeCategory, searchQuery]);

  const mealLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);

  return (
    <div className={styles.contentWrapper}>
      {/* ── Top bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <div className={styles.topBarTitle}>
            <h2>Add to Log</h2>
            <p>{mealLabel}</p>
          </div>
        </div>
        <button
          className={styles.backToHomeBtn}
          onClick={() => navigate('/dashboard')}
          id="food-log-back-btn"
        >
          <i className="fa-solid fa-house" />
          Back to Home
        </button>
      </div>

      {/* ── Scroll area ── */}
      <div className={styles.scrollArea}>
        {/* Search */}
        <div className={styles.searchBar}>
          <i className="fa-solid fa-magnifying-glass" />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search foods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="food-search-input"
          />
        </div>

        {/* Category tabs */}
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />

        {/* Food grid or error */}
        {error ? (
          <div className={styles.errorState}>
            <i className="fa-solid fa-triangle-exclamation" />
            <h3>Couldn't load foods</h3>
            <p>{error}</p>
            <button className={styles.retryBtn} onClick={refetch}>Try Again</button>
          </div>
        ) : (
          <FoodGrid
            foods={filteredFoods}
            loading={loading}
            selectedFoodId={selectedFood?.id ?? null}
            onSelectFood={setSelectedFood}
          />
        )}
      </div>

      {/* ── Right panel ── */}
      {selectedFood && (
        <FoodPanel
          food={selectedFood}
          mealType={mealType}
          onClose={() => setSelectedFood(null)}
          onSuccess={() => setSelectedFood(null)}
        />
      )}
    </div>
  );
};

export default FoodLogContent;
