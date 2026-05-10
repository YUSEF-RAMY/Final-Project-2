// API calls for foods and meals

export interface FoodNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size: string;
}

export interface Food {
  id: number;
  name: string;
  image_url: string | null;
  category: string;
  nutrition: FoodNutrition;
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token') || localStorage.getItem('userToken');
  if (!token) throw new Error('No authentication token found. Please log in again.');
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420',
  };
}

// Fetch all foods
export async function fetchFoods(): Promise<Food[]> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const response = await fetch(`${baseUrl}/foods`, {
    headers: getAuthHeaders(),
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
    result = {};
  }

  if (response.ok) {
    // Support diff response formats
    const foods = result.data || result;
    return Array.isArray(foods) ? foods : [];
  }

  throw new Error(result.message || 'Failed to fetch foods');
}

// Add food to meal
export async function addFoodToMeal(
  mealType: string,
  foodId: number,
  quantity: number
): Promise<unknown> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const response = await fetch(`${baseUrl}/foods/meals/${mealType}/items`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ food_id: foodId, quantity }),
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
    result = {};
  }

  if (response.ok) {
    return result;
  }

  throw new Error(result.message || 'Failed to add food to meal');
}
