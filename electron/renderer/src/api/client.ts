/**
 * Secure API Client
 * Automatically injects Bearer token and handles unauthorized responses
 */

export class SecureApiClient {
  private baseUrl: string
  private tokenKey = 'auth_token'

  constructor(baseUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:8000/api') {
    this.baseUrl = baseUrl
  }

  /**
   * Get token from session storage
   */
  private getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey)
  }

  /**
   * Get authorization headers
   */
  private getHeaders(includeAuth = true, contentType?: string): HeadersInit {
    const headers: HeadersInit = {}

    if (contentType) {
      headers['Content-Type'] = contentType
    }

    if (includeAuth) {
      const token = this.getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    return headers
  }

  /**
   * Handle API errors
   */
  private handleError(response: Response, data: any): void {
    if (response.status === 401) {
      // Unauthorized - clear session and redirect to login
      sessionStorage.removeItem(this.tokenKey)
      sessionStorage.removeItem('auth_user')
      window.location.href = '/auth'
      throw new Error('Unauthorized - Please login again')
    }

    if (response.status === 403) {
      throw new Error(data.message || 'Access forbidden')
    }

    if (response.status === 422) {
      throw new Error(data.message || 'Validation error')
    }

    throw new Error(data.message || `API Error: ${response.status}`)
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(true),
        ...options
      })

      const data = await response.json()

      if (!response.ok) {
        this.handleError(response, data)
      }

      return data
    } catch (error: any) {
      console.error(`GET ${endpoint} failed:`, error)
      throw error
    }
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(true, 'application/json'),
        body: body ? JSON.stringify(body) : undefined,
        ...options
      })

      const data = await response.json()

      if (!response.ok) {
        this.handleError(response, data)
      }

      return data
    } catch (error: any) {
      console.error(`POST ${endpoint} failed:`, error)
      throw error
    }
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(true, 'application/json'),
        body: body ? JSON.stringify(body) : undefined,
        ...options
      })

      const data = await response.json()

      if (!response.ok) {
        this.handleError(response, data)
      }

      return data
    } catch (error: any) {
      console.error(`PUT ${endpoint} failed:`, error)
      throw error
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(true),
        ...options
      })

      const data = await response.json()

      if (!response.ok) {
        this.handleError(response, data)
      }

      return data
    } catch (error: any) {
      console.error(`DELETE ${endpoint} failed:`, error)
      throw error
    }
  }

  /**
   * POST request without auth (for login/register)
   */
  async postPublic<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(false, 'application/json'),
        body: body ? JSON.stringify(body) : undefined,
        ...options
      })

      const data = await response.json()

      if (!response.ok) {
        this.handleError(response, data)
      }

      return data
    } catch (error: any) {
      console.error(`POST ${endpoint} failed:`, error)
      throw error
    }
  }

  /**
   * Download file (stream)
   */
  async downloadFile(endpoint: string, filename: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(true)
      })

      if (!response.ok) {
        const data = await response.json()
        this.handleError(response, data)
      }

      const blob = await response.blob()

      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error(`Download ${endpoint} failed:`, error)
      throw error
    }
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken()
  }
}

// Export singleton instance
export const apiClient = new SecureApiClient()

export default SecureApiClient
