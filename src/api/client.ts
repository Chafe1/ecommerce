import { ApiResponse } from '../shared/types.js';

let currentCsrfToken = '';

export function setCsrfToken(token: string) {
  currentCsrfToken = token;
}

export function getCsrfToken(): string {
  return currentCsrfToken;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (currentCsrfToken && !headers['x-csrf-token']) {
    headers['x-csrf-token'] = currentCsrfToken;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include', // Includes session cookies across requests
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg) as Error & { code?: string; details?: any };
    err.code = data?.error?.code;
    err.details = data?.error?.details;
    throw err;
  }

  // Update CSRF token if returned in response data
  if (data?.data?.csrfToken) {
    currentCsrfToken = data.data.csrfToken;
  }

  return data;
}
