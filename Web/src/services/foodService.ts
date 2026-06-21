// API calls for foods and meals

import { API_BASE_URL, getAuthHeaders, getAuthHeadersMultipart, handleUnauthorized } from './api';

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

// Fetch all foods
export async function fetchFoods(): Promise<Food[]> {
  const response = await fetch(`${API_BASE_URL}/foods`, {
    headers: getAuthHeaders(),
  });

  if (response.status === 401) handleUnauthorized();

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

import { clearDailySummaryCache } from './dailySummaryService';
import { clear7DayAveragesCache } from './analyticsService';

// Add food to meal
export async function addFoodToMeal(
  mealType: string,
  foodId: number,
  quantity: number
): Promise<unknown> {
  const formData = new FormData();
  formData.append('food_id', foodId.toString());
  formData.append('quantity', quantity.toString());

  const response = await fetch(`${API_BASE_URL}/foods/meals/${mealType}/items`, {
    method: 'POST',
    headers: getAuthHeadersMultipart(),
    body: formData,
  });

  if (response.status === 401) handleUnauthorized();

  const text = await response.text();
  let result;
  try {
    result = text ? JSON.parse(text) : {};
  } catch (e) {
    result = {};
  }

  if (response.ok) {
    clearDailySummaryCache();
    clear7DayAveragesCache();
    return result;
  }

  throw new Error(result.message || 'Failed to add food to meal');
}

// Delete a food item from a meal
export async function deleteFoodItem(itemId: number): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/foods/meals/items/${itemId}`, {
    method: 'DELETE',
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
    clearDailySummaryCache();
    clear7DayAveragesCache();
    return result;
  }

  throw new Error(result.message || 'Failed to delete food item');
}
