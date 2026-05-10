// ======================================================
// Hook: useFoods.ts
// Manages fetching and filtering foods from the API
// ======================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchFoods } from '../services/foodService';
import type { Food } from '../services/foodService';

interface UseFoodsResult {
  foods: Food[];
  categories: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFoods(): UseFoodsResult {
  const navigate = useNavigate();
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadFoods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFoods();
      setFoods(result);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED') {
        navigate('/login');
        return;
      }
      console.error('Foods API Error:', err);
      setError(err.message || 'Failed to load foods.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  // Extract unique categories from the fetched foods
  const categories = useMemo(() => {
    const cats = new Set<string>();
    foods.forEach((f) => {
      if (f.category) cats.add(f.category);
    });
    return ['All', ...Array.from(cats).sort()];
  }, [foods]);

  return { foods, categories, loading, error, refetch: loadFoods };
}
