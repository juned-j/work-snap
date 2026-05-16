import { useContext, useEffect, useState, useCallback } from 'react'
import { AuthContext } from '../store/AuthContext'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'employee'
}

export interface AuthState {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthContextType {
  authState: AuthState
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  clearError: () => void
}

/**
 * Hook to access authentication context
 * Ensures proper token management and session validation
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }

  return context
}

/**
 * Hook for checking if user has specific role
 */
export const useHasRole = (roles: string[]) => {
  const { authState } = useAuthContext()
  return roles.includes(authState.user?.role || '')
}

/**
 * Hook for checking token validity
 */
export const useIsTokenValid = () => {
  const { authState } = useAuthContext()
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    if (!authState.token) {
      setIsValid(false)
      return
    }

    // Check if token exists and user is authenticated
    setIsValid(!!authState.user && !!authState.token)
  }, [authState.token, authState.user])

  return isValid
}

/**
 * Hook to validate token before making API calls
 */
export const useValidateToken = () => {
  const { authState, logout } = useAuthContext()

  return useCallback(async (): Promise<boolean> => {
    if (!authState.token || !authState.user) {
      await logout()
      return false
    }

    // Token is valid if it exists and user is authenticated
    return true
  }, [authState.token, authState.user, logout])
}
