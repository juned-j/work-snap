import React, { createContext, useState, useEffect, useCallback, useRef } from 'react'
import type { AuthContextType, AuthState, AuthUser } from '../hooks/useAuthContext'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * AuthProvider Component
 * Manages global authentication state with secure token handling
 * - Stores token in memory (and sessionStorage to persist across reloads)
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

  // API Call Locks to prevent duplicate back-to-back requests (Stops 429 triggers)
  const isSubmittingLogin = useRef(false)
  const isSubmittingRegister = useRef(false)

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
      // If a request is already in progress, silently abort to prevent duplicate 429 issues
      if (isSubmittingLogin.current) {
        return { success: false, error: 'Login in progress, please wait...' }
      }

      try {
        isSubmittingLogin.current = true
        setAuthState(prev => ({ ...prev, error: null }))

        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })

        // Read the body stream exactly ONCE right here (handles both success and error)
        const text = await response.text()
        let data: any = {}
        
        try {
          data = JSON.parse(text)
        } catch (e) {
          // If it's pure HTML or plain text (like Laravel's default 429 page)
          data = { message: text }
        }

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('429: Too many login attempts. Please wait a moment.')
          }

          const backendMessage = data.message || 'Login failed'
          const validationMessage = data.errors?.email?.[0] || data.errors?.password?.[0]
          throw new Error(validationMessage || backendMessage)
        }

        // Store token and user in session storage
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
      } finally {
  // Bina kisi delay ke lock ko turant clear karein
  isSubmittingLogin.current = false
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
      if (isSubmittingRegister.current) {
        return { success: false, error: 'Registration in progress, please wait...' }
      }

      try {
        isSubmittingRegister.current = true
        setAuthState(prev => ({ ...prev, error: null }))

        const response = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, password_confirmation: password })
        })

        // Read the body stream exactly ONCE right here
        const text = await response.text()
        let data: any = {}

        try {
          data = JSON.parse(text)
        } catch (e) {
          data = { message: text }
        }

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('429: Too many requests. Please wait a moment.')
          }

          const backendMessage = data.message || 'Registration failed'
          const validationMessage =
            data.errors?.name?.[0] ||
            data.errors?.email?.[0] ||
            data.errors?.password?.[0]
          throw new Error(validationMessage || backendMessage)
        }

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
      } finally {
        setTimeout(() => {
          isSubmittingRegister.current = false
        }, 1000)
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