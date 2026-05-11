// API calls for user profile

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
}

export interface UserProfile {
  name: string;
  email: string;
  profile_image: string | null;
  physical_profile: {
    age: number;
    height: number;
    weight: number;
    gender: string;
    activity_level: string;
    primary_objective: string;
    medical_conditions: string | null;
    last_updated: string;
  };
  nutritional_targets: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  latest_body_report: LatestBodyReport | null;
  created_at: string;
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

export async function fetchProfile(): Promise<UserProfile> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const response = await fetch(`${baseUrl}/profile`, {
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
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const headers = getAuthHeaders();
  await fetch(`${baseUrl}/logout`, {
    method: 'POST',
    headers,
  });
  // Always clear local tokens regardless of response
  localStorage.removeItem('token');
  localStorage.removeItem('userToken');
}
