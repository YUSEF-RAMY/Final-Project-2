// API calls for notifications

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
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

// GET /notifications
export async function fetchNotifications(): Promise<AppNotification[]> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const response = await fetch(`${baseUrl}/notifications`, {
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
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const response = await fetch(`${baseUrl}/notifications/mark-as-read`, {
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
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const response = await fetch(`${baseUrl}/notifications/clear`, {
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
