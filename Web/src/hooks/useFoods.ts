// Loads the food list from the API and builds a unique category list for the filter tabs.

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
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      if (errorObj.message === 'UNAUTHORIZED') {
        navigate('/login');
        return;
      }
      console.error('Foods API Error:', err);
      setError(errorObj.message || 'Failed to load foods.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    Promise.resolve().then(() => loadFoods());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pull unique category names out of the food list so we can show the filter tabs
  const categories = useMemo(() => {
    const cats = new Set<string>();
    foods.forEach((f) => {
      if (f.category) cats.add(f.category);
    });
    return ['All', ...Array.from(cats).sort()];
  }, [foods]);

  return { foods, categories, loading, error, refetch: loadFoods };
}
