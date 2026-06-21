// Combines daily-summary and profile data into a single object for the Plan page.

import { fetchDailySummary } from './dailySummaryService';
import type { DailySummaryData } from './dailySummaryService';
import { fetchProfile } from './profileService';
import type { UserProfile } from './profileService';
import { API_BASE_URL, getAuthHeaders, handleUnauthorized } from './api';

export interface PlanData {
  summary: DailySummaryData;
  profile: UserProfile;
}

export async function fetchPlanData(date: string, force = false): Promise<PlanData> {
  const [summary, profile] = await Promise.all([
    fetchDailySummary(date, force),
    fetchProfile(force),
  ]);
  return { summary, profile };
}

export interface TargetsPayload {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

// Saves nutritional targets back to the API.
export async function updateTargets(payload: TargetsPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/profile/targets`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (response.status === 401) handleUnauthorized();

  if (!response.ok) {
    const text = await response.text();
    let result: { message?: string } = {};
    try { result = JSON.parse(text); } catch { /* ignore */ }
    throw new Error(result.message || 'Failed to update targets');
  }
}
