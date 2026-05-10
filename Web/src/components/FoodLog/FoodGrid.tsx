import React from 'react';
import type { Food } from '../../services/foodService';
import FoodCard from './FoodCard';
import styles from './FoodGrid.module.css';

interface FoodGridProps {
  foods: Food[];
  loading: boolean;
  selectedFoodId: number | null;
  onSelectFood: (food: Food) => void;
}

const FoodGrid: React.FC<FoodGridProps> = ({ foods, loading, selectedFoodId, onSelectFood }) => {
  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div className={styles.skeletonCard} key={i}>
            <div className={styles.skeletonImage} />
            <div className={styles.skeletonBody}>
              <div className={styles.skeletonLine} />
              <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (foods.length === 0) {
    return (
      <div className={styles.grid}>
        <div className={styles.emptyState}>
          <i className="fa-solid fa-bowl-rice"></i>
          <p>No foods found in this category.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {foods.map((food, i) => (
        <FoodCard
          key={food.id}
          food={food}
          isSelected={selectedFoodId === food.id}
          onClick={onSelectFood}
          style={{ animationDelay: `${i * 0.04}s` }}
        />
      ))}
    </div>
  );
};

export default FoodGrid;
