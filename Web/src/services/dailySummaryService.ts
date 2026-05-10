// API calls for daily summary

export interface MacroData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealItem {
  id: number | null;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url: string | null;
  quantity: number;
  unit: string;
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

export async function fetchDailySummary(date: string): Promise<DailySummaryData> {
  const token = localStorage.getItem('token') || localStorage.getItem('userToken');
  if (!token) throw new Error('No authentication token found. Please log in again.');

  const baseUrl = import.meta.env.API_BASE_URL;
  const fullUrl = `${baseUrl}/foods/daily-summary?date=${date}`;
  console.log('Full URL Debug:', fullUrl);
  
  const response = await fetch(fullUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'ngrok-skip-browser-warning': '69420',
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('userToken');
    throw new Error('UNAUTHORIZED');
  }

  const text = await response.text();
  let result;
  try {
    result = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error(`Server returned invalid JSON: ${text.substring(0, 100)}`);
  }

  if (response.ok) {
    const finalData = result.data || result;
    console.log('Daily Summary Debug:', { url: response.url, status: response.status, data: finalData });
    
    // Return the data if it's not null/undefined
    if (finalData && typeof finalData === 'object') {
      return finalData as DailySummaryData;
    }
  }

  console.error('Daily Summary Error Details:', { status: response.status, result });
  throw new Error(result.message || result.error || 'Failed to fetch daily summary');
}
