// API calls for the Analytics page

import { API_BASE_URL, getAuthHeaders, handleUnauthorized } from './api';
import { fetchDailySummary } from './dailySummaryService';

export interface InBodyRecord {
  id?: number;
  measured_at?: string;
  created_at?: string;
  weight: number;
  bmi: number;
  muscle_mass: number;
  body_fat_percentage: number;
  body_fat_mass?: number;
  visceral_fat?: string | number;
  water?: number;
  protein?: number;
  minerals?: number;
  image?: string | null;
  inbody_image?: string | null;
}

export interface SevenDayAverages {
  calories: number;
  protein: number;
  hydration: number;
  daysWithData: number;
}

// GET /inbody/history — falls back gracefully to empty array
export async function fetchInBodyHistory(): Promise<InBodyRecord[]> {
  const response = await fetch(`${API_BASE_URL}/inbody/history`, {
    headers: getAuthHeaders(),
  });

  if (response.status === 401) handleUnauthorized();

  const text = await response.text();
  let result;
  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    result = {};
  }

  if (response.ok) {
    const data = result.data || result;
    return Array.isArray(data) ? data.map(normaliseRecord) : [];
  }

  return [];
}

// GET /inbody/latest
export async function fetchLatestInBody(): Promise<InBodyRecord | null> {
  const response = await fetch(`${API_BASE_URL}/inbody/latest`, {
    headers: getAuthHeaders(),
  });

  if (response.status === 401) handleUnauthorized();

  const text = await response.text();
  let result;
  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    result = {};
  }

  if (response.ok && result.data) {
    return normaliseRecord(result.data);
  }

  return null;
}

// Fetch the last 7 daily summaries and return averaged macro values
export async function fetch7DayAverages(): Promise<SevenDayAverages> {
  const today = new Date();
  const dates: string[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const settled = await Promise.allSettled(dates.map((date) => fetchDailySummary(date)));

  let totalCalories = 0;
  let totalProtein = 0;
  let daysWithData = 0;

  for (const result of settled) {
    if (result.status === 'fulfilled') {
      const overview = result.value.overview;
      if (overview.consumed.calories > 0) {
        totalCalories += overview.consumed.calories;
        totalProtein  += overview.consumed.protein;
        daysWithData++;
      }
    }
  }

  const days = daysWithData || 1;
  const waterTarget = Number(localStorage.getItem('hfy_water_target')) || 2.5;

  return {
    calories:     +(totalCalories / days).toFixed(1),
    protein:      +(totalProtein  / days).toFixed(1),
    hydration:    waterTarget,
    daysWithData,
  };
}

// Coerce all numeric string fields the API might return
function normaliseRecord(r: Record<string, unknown>): InBodyRecord {
  return {
    ...r,
    weight:                Number(r.weight               ?? 0),
    bmi:                   Number(r.bmi                  ?? 0),
    muscle_mass:           Number(r.muscle_mass          ?? 0),
    body_fat_percentage:   Number(r.body_fat_percentage  ?? 0),
    body_fat_mass:         Number(r.body_fat_mass        ?? 0),
    water:                 Number(r.water                ?? 0),
    protein:               Number(r.protein              ?? 0),
    minerals:              Number(r.minerals             ?? 0),
  } as InBodyRecord;
}
