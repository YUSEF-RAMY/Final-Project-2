// API calls for foods and meals

import { API_BASE_URL, getAuthHeaders, handleUnauthorized } from './api';

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

// Add food to meal
export async function addFoodToMeal(
  mealType: string,
  foodId: number,
  quantity: number
): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/foods/meals/${mealType}/items`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ food_id: foodId, quantity }),
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
    return result;
  }

  throw new Error(result.message || 'Failed to add food to meal');
}

// Delete a food item from a meal
export async function deleteFoodItem(itemId: number): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/foods/delete-item/${itemId}`, {
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
    return result;
  }

  throw new Error(result.message || 'Failed to delete food item');
}
