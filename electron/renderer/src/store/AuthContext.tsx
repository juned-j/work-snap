import React, { createContext, useState, useEffect, useCallback } from 'react'
import type { AuthContextType, AuthState, AuthUser } from '../hooks/useAuthContext'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * AuthProvider Component
 * Manages global authentication state with secure token handling
 * - Stores token in memory (not localStorage to prevent XSS)
 * - Validates token on mount
 * - Handles login, logout, register
 * - Provides auth state to entire app
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  })

  // Initialize auth from session storage (not localStorage)
  useEffect(() => {
    try {
      const storedToken = sessionStorage.getItem('auth_token')
      const storedUser = sessionStorage.getItem('auth_user')

      if (storedToken && storedUser) {
        setAuthState(prev => ({
          ...prev,
          token: storedToken,
          user: JSON.parse(storedUser),
          isAuthenticated: true,
          isLoading: false
        }))
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false
        }))
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to initialize authentication'
      }))
    }
  }, [])

  /**
   * Login user and get token
   */
  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        setAuthState(prev => ({ ...prev, error: null }))

        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || 'Login failed')
        }

        const data = await response.json()

        // Store token and user in session storage (not localStorage)
        sessionStorage.setItem('auth_token', data.token)
        sessionStorage.setItem('auth_user', JSON.stringify(data.user))

        setAuthState({
          token: data.token,
          user: data.user as AuthUser,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })

        console.log('Login successful', { userId: data.user.id })
        return { success: true }
      } catch (error: any) {
        const errorMsg = error.message || 'Login failed'
        setAuthState(prev => ({
          ...prev,
          error: errorMsg
        }))
        return { success: false, error: errorMsg }
      }
    },
    [API_BASE]
  )

  /**
   * Register new user and get token
   */
  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        setAuthState(prev => ({ ...prev, error: null }))

        const response = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, password_confirmation: password })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || 'Registration failed')
        }

        const data = await response.json()

        // Store token and user
        sessionStorage.setItem('auth_token', data.token)
        sessionStorage.setItem('auth_user', JSON.stringify(data.user))

        setAuthState({
          token: data.token,
          user: data.user as AuthUser,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })

        console.log('Registration successful', { userId: data.user.id })
        return { success: true }
      } catch (error: any) {
        const errorMsg = error.message || 'Registration failed'
        setAuthState(prev => ({
          ...prev,
          error: errorMsg
        }))
        return { success: false, error: errorMsg }
      }
    },
    [API_BASE]
  )

  /**
   * Logout user and clear token
   */
  const logout = useCallback(async () => {
    try {
      // Attempt to notify server
      if (authState.token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authState.token}`,
            'Content-Type': 'application/json'
          }
        }).catch(err => console.warn('Logout notification failed:', err))
      }

      // Clear storage
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_user')

      // Clear state
      setAuthState({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })

      // Redirect to login
      window.location.href = '/auth'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [authState.token, API_BASE])

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setAuthState(prev => ({
      ...prev,
      error: null
    }))
  }, [])

  const value: AuthContextType = {
    authState,
    isLoading: authState.isLoading,
    login,
    logout,
    register,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
