// API client configuration for frontend
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!response.ok) throw new Error('API request failed');
  return response.json();
}
