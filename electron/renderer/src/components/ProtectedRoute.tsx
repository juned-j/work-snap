import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
  fallback?: React.ReactNode
}

/**
 * ProtectedRoute Component
 * Prevents unauthorized access to sensitive routes
 * - Checks if user is authenticated
 * - Verifies token validity
 * - Checks user roles if specified
 * - Redirects to login if unauthorized
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallback
}) => {
  const { authState, isLoading } = useAuthContext()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (isLoading) return

    // Check if user is authenticated
    const isAuthenticated = !!authState.token && !!authState.user

    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/auth'
      return
    }

    // Check if user has required role
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.includes(authState.user?.role || '')
      if (!hasRequiredRole) {
        console.error('User does not have required role', {
          userRole: authState.user?.role,
          requiredRoles
        })
        setIsAuthorized(false)
        return
      }
    }

    setIsAuthorized(true)
  }, [authState, isLoading, requiredRoles])

  if (isLoading) {
    return fallback || <div className="p-4">Loading...</div>
  }

  if (!isAuthorized) {
    return fallback || <div className="p-4 text-red-600">Unauthorized</div>
  }

  return <>{children}</>
}

export default ProtectedRoute
