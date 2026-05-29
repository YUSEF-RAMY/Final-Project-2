// Manages loading, error, and refetch state for the Plan page.

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPlanData } from '../services/planService';
import type { PlanData } from '../services/planService';

interface UsePlanResult {
  data: PlanData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePlan(): UsePlanResult {
  const navigate = useNavigate();
  const [data, setData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized so it never changes identity mid-session — avoids infinite refetch loop
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPlanData(today);
      setData(result);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      if (errorObj.message === 'UNAUTHORIZED') {
        navigate('/login');
        return;
      }
      console.error('Plan API error:', err);
      setError(errorObj.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [navigate, today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh when the user switches back to this tab.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') loadData();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [loadData]);

  return { data, loading, error, refetch: loadData };
}

