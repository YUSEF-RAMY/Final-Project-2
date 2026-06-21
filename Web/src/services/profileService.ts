// API calls for user profile

import { API_BASE_URL, getAuthHeaders, handleUnauthorized } from './api';

export interface LatestBodyReport {
  height: number;
  weight: number;
  age: number;
  gender: string;
  muscle_mass: number;
  body_fat_percentage: number; // pbf
  body_fat_mass: number;
  water: number;
  protein: number;
  minerals: number;
  bmi: number;
  hmr: number;
  measured_at: string;
  created_at: string;
  image: string | null;
  classification?: {
    category: string;
    reasoning: string;
  } | null;
}

export interface UserProfile {
  name: string;
  email: string;
  profile_image: string | null;
  physical_profile?: {
    age: number;
    height: number;
    weight: number;
    gender: string;
    activity_level: string;
    primary_objective: string;
    medical_conditions: string | null;
    last_updated: string;
  } | null;
  nutritional_targets?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  } | null;
  latest_body_report: LatestBodyReport | null;
  body_reports?: any[];
  created_at: string;
}

export async function fetchProfile(): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/profile`, {
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
    return data as UserProfile;
  }

  throw new Error(result.message || 'Failed to fetch profile');
}

export async function logout(): Promise<void> {
  const headers = getAuthHeaders();
  await fetch(`${API_BASE_URL}/logout`, {
    method: 'POST',
    headers,
  });
  // Always clear local tokens regardless of response
  localStorage.removeItem('token');
  localStorage.removeItem('userToken');
}
