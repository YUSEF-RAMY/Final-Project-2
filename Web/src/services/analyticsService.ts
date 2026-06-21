// API calls for the Analytics page

import { API_BASE_URL, getAuthHeaders, handleUnauthorized } from './api';
import { fetchDailySummary } from './dailySummaryService';

export interface InBodyRecord {
  id?: number;
  measured_at?: string;
  created_at?: string;
  height?: number;
  age?: number;
  gender?: string;
  weight: number;
  bmi: number;
  muscle_mass: number;
  body_fat_percentage: number;
  body_fat_mass?: number;
  visceral_fat?: string | number;
  water?: number;
  protein?: number;
  minerals?: number;
  bmr?: number;
  tdee?: number;
  inbody_score?: number;
  lbm?: number;
  calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fats?: number;
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

let averagesCache: SevenDayAverages | null = null;
let averagesCachePromise: Promise<SevenDayAverages> | null = null;
let averagesCacheTime = 0;

export function prefetch7DayAverages() {
  fetch7DayAverages().catch(() => {});
}

// Fetch the last 7 daily summaries and return averaged macro values
export async function fetch7DayAverages(force = false): Promise<SevenDayAverages> {
  if (!force && averagesCache && Date.now() - averagesCacheTime < 60000) {
    return averagesCache;
  }
  if (!force && averagesCachePromise) {
    return averagesCachePromise;
  }

  averagesCachePromise = (async () => {
    try {
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

      averagesCache = {
        calories:     +(totalCalories / days).toFixed(1),
        protein:      +(totalProtein  / days).toFixed(1),
        hydration:    waterTarget,
        daysWithData,
      };
      averagesCacheTime = Date.now();
      averagesCachePromise = null;
      return averagesCache;
    } catch (error) {
      averagesCachePromise = null;
      throw error;
    }
  })();

  return averagesCachePromise;
}

// Coerce all numeric string fields the API might return
export function normaliseRecord(r: Record<string, unknown>): InBodyRecord {
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
    bmr:                   r.bmr != null ? Number(r.bmr) : undefined,
    tdee:                  r.tdee != null ? Number(r.tdee) : undefined,
    inbody_score:          r.inbody_score != null ? Number(r.inbody_score) : undefined,
    lbm:                   r.lbm != null ? Number(r.lbm) : undefined,
    calories:              r.calories != null ? Number(r.calories) : undefined,
    target_protein:        r.target_protein != null ? Number(r.target_protein) : undefined,
    target_carbs:          r.target_carbs != null ? Number(r.target_carbs) : undefined,
    target_fats:           r.target_fats != null ? Number(r.target_fats) : undefined,
  } as InBodyRecord;
}
