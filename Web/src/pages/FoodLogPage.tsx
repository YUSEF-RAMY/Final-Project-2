import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './FoodLogPage.module.css';
import Sidebar from '../components/home/sidebar/Sidebar';
import CategoryTabs from '../components/FoodLog/CategoryTabs';
import FoodGrid from '../components/FoodLog/FoodGrid';
import FoodPanel from '../components/FoodLog/FoodPanel';
import { useFoods } from '../hooks/useFoods';
import type { Food } from '../services/foodService';

const FoodLogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mealType = searchParams.get('meal') || 'breakfast';

  const { foods, categories, loading, error, refetch } = useFoods();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  // Filter foods
  const filteredFoods = useMemo(() => {
    let result = foods;

    if (activeCategory !== 'All') {
      result = result.filter((f) => f.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [foods, activeCategory, searchQuery]);

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
  };

  const handlePanelClose = () => {
    setSelectedFood(null);
  };

  const handleAddSuccess = () => {
    setSelectedFood(null);
    // Stay on page
  };

  const mealLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);

  return (
    <div className={styles.pageLayout}>
      <Sidebar />
      <div className={styles.mainContent}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <div className={styles.topBarTitle}>
              <h2>Add to Log</h2>
              <p>{mealLabel}</p>
            </div>
          </div>
          <button className={styles.backToHomeBtn} onClick={() => navigate('/dashboard')}>
            <i className="fa-solid fa-house"></i>
            Back to Home
          </button>
        </div>

        {/* Scroll area */}
        <div className={styles.scrollArea}>
          {/* Search */}
          <div className={styles.searchBar}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search foods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />

          {/* Conditional Rendering for Error or Content */}
          {error ? (
            <div className={styles.errorState}>
              <i className="fa-solid fa-triangle-exclamation"></i>
              <h3>Couldn't load foods</h3>
              <p>{error}</p>
              <button className={styles.retryBtn} onClick={refetch}>Try Again</button>
            </div>
          ) : (
            <FoodGrid
              foods={filteredFoods}
              loading={loading}
              selectedFoodId={selectedFood?.id ?? null}
              onSelectFood={handleSelectFood}
            />
          )}
        </div>
      </div>

      {/* Right panel */}
      {selectedFood && (
        <FoodPanel
          food={selectedFood}
          mealType={mealType}
          onClose={handlePanelClose}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  );
};

export default FoodLogPage;