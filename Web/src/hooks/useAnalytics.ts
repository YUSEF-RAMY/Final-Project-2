// Fetches and assembles all data required by the Analytics page.

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProfile } from '../services/profileService';
import type { UserProfile } from '../services/profileService';
import {
  fetch7DayAverages,
  normaliseRecord,
} from '../services/analyticsService';
import type { InBodyRecord, SevenDayAverages } from '../services/analyticsService';
import { generateInsight } from '../utils/aiAnalysis';
import type { AIInsight } from '../utils/aiAnalysis';

export interface AnalyticsData {
  profile:   UserProfile;
  history:   InBodyRecord[];
  averages:  SevenDayAverages;
  insight:   AIInsight;
}

interface UseAnalyticsResult {
  data:    AnalyticsData | null;
  loading: boolean;
  error:   string | null;
  refetch: () => void;
}

export function useAnalytics(): UseAnalyticsResult {
  const navigate = useNavigate();
  const [data,    setData]    = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch profile and 7-day averages in parallel
      const [profile, averages] = await Promise.all([
        fetchProfile(),
        fetch7DayAverages(),
      ]);

      // Use body_reports from the profile response
      const rawReports = Array.isArray(profile.body_reports) ? profile.body_reports : [];
      let records: InBodyRecord[] = rawReports.map(normaliseRecord);

      // Fallback: If no body_reports array exists but latest_body_report exists, use that
      if (records.length === 0 && profile.latest_body_report) {
        records = [normaliseRecord(profile.latest_body_report as unknown as Record<string, unknown>)];
      }

      const insight = generateInsight(profile, averages, records);

      setData({ profile, history: records, averages, insight });
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? 'Unexpected error';
      if (msg === 'UNAUTHORIZED') {
        navigate('/login');
        return;
      }
      console.error('Analytics load error:', err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const initialLoadRef = useRef(false);
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      load();
    }
  }, [load]);

  // Refresh on tab focus
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  return { data, loading, error, refetch: load };
}

// ── Chart data builder ────────────────────────────────────────────────────────

export type ChartPeriod = '1M' | '3M' | 'YTD';

export interface ChartPoint {
  label:    string;     // "Aug", "Sep 12", etc.
  date:     string;
  weight:   number;
  muscle:   number;
  fatMass:  number;     // weight - muscle_mass (used for dashed line)
}



export function buildChartData(history: InBodyRecord[], period: ChartPeriod): ChartPoint[] {
  if (!history.length) return [];

  const now = new Date();
  let cutoff: Date;

  if (period === '1M') {
    cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 1);
  } else if (period === '3M') {
    cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 3);
  } else {
    cutoff = new Date(now.getFullYear(), 0, 1);
  }

  let sorted = [...history]
    .filter((r) => {
      const d = new Date(r.measured_at ?? r.created_at ?? '');
      return !isNaN(d.getTime()) && d >= cutoff;
    })
    .sort((a, b) =>
      new Date(a.measured_at ?? a.created_at ?? '').getTime() -
      new Date(b.measured_at ?? b.created_at ?? '').getTime()
    );

  // If no records within the selected period, show all records sorted by date
  if (sorted.length === 0) {
    sorted = [...history]
      .filter((r) => {
        const d = new Date(r.measured_at ?? r.created_at ?? '');
        return !isNaN(d.getTime());
      })
      .sort((a, b) =>
        new Date(a.measured_at ?? a.created_at ?? '').getTime() -
        new Date(b.measured_at ?? b.created_at ?? '').getTime()
      );
  }

  // Track how many times a label string appears to make it unique
  const labelCounts: Record<string, number> = {};

  return sorted.map((r) => {
    const d = new Date(r.measured_at ?? r.created_at ?? '');
    const w  = Number(r.weight);
    const m  = Number(r.muscle_mass);
    
    let labelStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    if (labelCounts[labelStr]) {
      labelCounts[labelStr]++;
      // Add time to make it unique if multiple scans on the same day
      const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      labelStr = `${labelStr} (${timeStr})`;
    } else {
      labelCounts[labelStr] = 1;
    }

    return {
      label:   labelStr,
      date:    (r.measured_at ?? r.created_at ?? '').slice(0, 10),
      weight:  w,
      muscle:  m,
      fatMass: +(w - m).toFixed(1),
    };
  });
}

