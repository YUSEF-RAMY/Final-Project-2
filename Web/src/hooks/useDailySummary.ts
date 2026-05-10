// ======================================================
// Hook: useDailySummary.ts
// Manages fetching state for the daily summary API
// ======================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDailySummary } from '../services/dailySummaryService';
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

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDailySummary(today);
      setData(result);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED') {
        navigate('/login');
        return;
      }
      console.error('Dashboard API Error:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [navigate, today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, refetch: loadData };
}
