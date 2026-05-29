// Everything related to fetching the user's daily nutrition summary from the backend

import { API_BASE_URL, getAuthHeaders, handleUnauthorized } from './api';

export interface MacroData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface TotalNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealItem {
  id?: number;
  food_id: number;
  name: string;
  image_url: string | null;
  quantity: number;
  total_nutrition: TotalNutrition;
  entries: { id: number; quantity: number }[];
}

export interface MealMetrics {
  consumed_calories: number;
  target_calories: number;
  remaining_calories: number;
}

export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  metrics: MealMetrics;
  items: MealItem[];
}

export interface DailySummaryData {
  overview: {
    target: MacroData;
    consumed: MacroData;
    remaining: MacroData;
    progress: { calories_percentage: number; protein_percentage: number };
    status: string;
  };
  meal_targets: {
    breakfast: MacroData;
    lunch: MacroData;
    dinner: MacroData;
    snacks: MacroData;
  };
  meals: Meal[];
}

// Quick note: the backend has a known bug where it multiplies macro values by the
// raw quantity instead of dividing by 100 first. So everything comes back 100x
// too big. We fix that here before any component ever sees the numbers.
function normalizeDailySummary(data: DailySummaryData): DailySummaryData {
  const fix = (n: number): number => +(n / 100).toFixed(2);

  const fixMacro = (m: MacroData): MacroData => ({
    calories: fix(Number(m.calories)),
    protein:  fix(Number(m.protein)),
    carbs:    fix(Number(m.carbs)),
    fat:      fix(Number(m.fat)),
  });

  const correctedConsumed = fixMacro(data.overview.consumed);

  return {
    ...data,
    overview: {
      ...data.overview,
      consumed: correctedConsumed,
      // Recalculate remaining ourselves since the API's remaining is also inflated
      remaining: {
        calories: Math.max(0, +(data.overview.target.calories - correctedConsumed.calories).toFixed(2)),
        protein:  Math.max(0, +(data.overview.target.protein  - correctedConsumed.protein ).toFixed(2)),
        carbs:    Math.max(0, +(data.overview.target.carbs    - correctedConsumed.carbs   ).toFixed(2)),
        fat:      Math.max(0, +(data.overview.target.fat      - correctedConsumed.fat     ).toFixed(2)),
      },
    },
    meals: data.meals.map((meal) => {
      const fixedConsumed = fix(Number(meal.metrics.consumed_calories));
      return {
        ...meal,
        metrics: {
          ...meal.metrics,
          consumed_calories:  fixedConsumed,
          remaining_calories: Math.max(0, +(Number(meal.metrics.target_calories) - fixedConsumed).toFixed(2)),
        },
        items: meal.items.map((item) => ({
          ...item,
          total_nutrition: fixMacro(item.total_nutrition),
        })),
      };
    }),
  };
}

export async function fetchDailySummary(date: string): Promise<DailySummaryData> {
  const token = localStorage.getItem('token') || localStorage.getItem('userToken');
  if (!token) throw new Error('No authentication token found. Please log in again.');

  const response = await fetch(`${API_BASE_URL}/foods/daily-summary?date=${date}`, {
    headers: getAuthHeaders(),
  });

  if (response.status === 401) handleUnauthorized();

  const text = await response.text();
  let result;
  try {
    result = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error(`Server returned invalid JSON: ${text.substring(0, 100)}`);
  }

  if (response.ok) {
    const finalData = result.data || result;
    if (finalData && typeof finalData === 'object') {
      // Run the fix before passing anything to the UI
      return normalizeDailySummary(finalData as DailySummaryData);
    }
  }

  console.error('Daily Summary Error Details:', { status: response.status, result });
  throw new Error(result.message || result.error || 'Failed to fetch daily summary');
}
