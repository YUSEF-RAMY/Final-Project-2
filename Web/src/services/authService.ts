// ─── Auth Service ─────────────────────────────────────────────────────────────
// Centralised authentication logic: login, register, Google OAuth, device tokens.
// All auth-related API calls go through this file for easy maintenance.

import { API_BASE_URL } from './api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    token: string;
    user?: Record<string, unknown>;
  };
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': '69420',
};

const MULTIPART_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  'ngrok-skip-browser-warning': '69420',
};

// ─── Token helpers ───────────────────────────────────────────────────────────

/** Persist the auth token received from the backend. */
export function saveToken(token: string): void {
  localStorage.setItem('userToken', token);
}

/** Read the stored auth token. */
export function getToken(): string | null {
  return localStorage.getItem('token') || localStorage.getItem('userToken');
}

/** Clear all stored auth tokens. */
export function clearTokens(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('userToken');
}

// ─── Device registration ─────────────────────────────────────────────────────

/** Returns (and lazily creates) a persistent web device token. */
export function getOrCreateDeviceToken(): string {
  let deviceToken = localStorage.getItem('manual_device_token');
  if (!deviceToken) {
    deviceToken = `web-${crypto.randomUUID()}-${Date.now()}`;
    localStorage.setItem('manual_device_token', deviceToken);
  }
  return deviceToken;
}

/** Register this browser as a device for push notifications. */
export async function registerDevice(authToken: string): Promise<void> {
  const fcmToken = getOrCreateDeviceToken();
  try {
    await fetch(`${API_BASE_URL}/devices/register`, {
      method: 'POST',
      body: JSON.stringify({ fcm_token: fcmToken, device_type: 'web' }),
      headers: {
        ...DEFAULT_HEADERS,
        Authorization: `Bearer ${authToken}`,
      },
    });
  } catch (err) {
    // Device registration is best-effort; don't block the auth flow.
    console.error('Device registration failed:', err);
  }
}

// ─── Email / Password login ──────────────────────────────────────────────────

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: DEFAULT_HEADERS,
  });

  const result: AuthResponse = await res.json();

  if (!res.ok || result.status !== 'success') {
    throw new Error(result.message || 'Incorrect email or password');
  }

  return result;
}

// ─── Email / Password register ───────────────────────────────────────────────

export async function registerWithEmail(formData: FormData): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    body: formData,
    headers: MULTIPART_HEADERS,
  });

  const result: AuthResponse = await res.json();

  if (!res.ok || result.status !== 'success') {
    throw new Error(result.message || 'Registration failed');
  }

  return result;
}

// ─── Google OAuth ────────────────────────────────────────────────────────────

/**
 * Initiates the Google OAuth flow by fetching the redirect URL from the backend
 * and then redirecting the browser to Google's consent screen.
 */
export async function initiateGoogleLogin(): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/google/redirect`, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
    });
    
    if (!res.ok) {
      throw new Error('Failed to initiate Google Login');
    }
    
    const result = await res.json();
    if (result.url) {
      window.location.href = result.url;
    } else {
      throw new Error('No redirect URL provided by the server');
    }
  } catch (error) {
    console.error('Google OAuth Initiation Error:', error);
    throw error;
  }
}
