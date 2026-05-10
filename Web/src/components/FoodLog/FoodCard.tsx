import React from 'react';
import type { Food } from '../../services/foodService';
import styles from './FoodCard.module.css';

interface FoodCardProps {
  food: Food;
  isSelected: boolean;
  onClick: (food: Food) => void;
  style?: React.CSSProperties;
}

const FoodCard: React.FC<FoodCardProps> = ({ food, isSelected, onClick, style }) => {
  return (
    <div
      className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
      onClick={() => onClick(food)}
      style={style}
    >
      <div className={styles.imageWrapper}>
        {food.image_url ? (
          <img src={food.image_url} alt={food.name} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.imagePlaceholder}>
            <i className="fa-solid fa-bowl-food"></i>
          </div>
        )}
        <span className={styles.categoryBadge}>{food.category}</span>
      </div>
      <div className={styles.info}>
        <h4 className={styles.name}>{food.name}</h4>
        <div className={styles.macros}>
          <span><span className={styles.macroBold}>{food.nutrition.calories}</span> kcal</span>
          <span>{food.nutrition.protein}g pro</span>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
