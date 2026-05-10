import React from 'react';
import styles from './CategoryTabs.module.css';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, activeCategory, onSelect }) => {
  return (
    <div className={styles.tabsContainer}>
      {categories.map((cat) => (
        <button
          key={cat}
          className={`${styles.tab} ${activeCategory === cat ? styles.tabActive : ''}`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
