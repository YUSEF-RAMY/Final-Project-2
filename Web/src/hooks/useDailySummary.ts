import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDailySummary, clearDailySummaryCache } from '../services/dailySummaryService';
import type { DailySummaryData } from '../services/dailySummaryService';

interface UseDailySummaryResult {
  data: DailySummaryData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDailySummary(): UseDailySummaryResult {
  const navigate = useNavigate();
  const [data, setData] = useState<DailySummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const loadData = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      if (force) clearDailySummaryCache(today);
      const result = await fetchDailySummary(today, force);
      setData(result);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      if (errorObj.message === 'UNAUTHORIZED') {
        navigate('/login');
        return;
      }
      console.error('Dashboard API Error:', err);
      setError(errorObj.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [navigate, today]);

  // Kick off the first fetch when the component mounts
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Re-fetch whenever the user switches back to this tab or focuses the window.
  // That way the dashboard always shows fresh numbers after they return from the food log.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData(true);
      }
    };
    const handleFocus = () => {
      loadData(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadData]);

  return { data, loading, error, refetch: () => loadData(true) };
}

