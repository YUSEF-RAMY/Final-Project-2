// API calls for notifications

import { API_BASE_URL, getAuthHeaders } from './api';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

// GET /notifications
export async function fetchNotifications(): Promise<AppNotification[]> {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    headers: getAuthHeaders(),
  });

  if (response.status === 401) throw new Error('UNAUTHORIZED');

  const text = await response.text();
  let result;
  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    result = {};
  }

  if (response.ok) {
    const data = result.data || result;
    return Array.isArray(data) ? data : [];
  }

  throw new Error(result.message || 'Failed to fetch notifications');
}

// POST /notifications/mark-as-read
export async function markNotificationsAsRead(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/notifications/mark-as-read`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const text = await response.text();
    let result;
    try { result = text ? JSON.parse(text) : {}; } catch { result = {}; }
    throw new Error(result.message || 'Failed to mark notifications as read');
  }
}

// DELETE /notifications/clear
export async function clearAllNotifications(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/notifications/clear`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const text = await response.text();
    let result;
    try { result = text ? JSON.parse(text) : {}; } catch { result = {}; }
    throw new Error(result.message || 'Failed to clear notifications');
  }
}
