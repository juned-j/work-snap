import { useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'
import LoginForm from './LoginForm'

export default function Login({
  onToggle,
  onForgotPassword,
}: {
  onToggle: () => void
  onForgotPassword: () => void
}) {

  const { login } = useAuthContext()

  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Auth error state
  const [authError, setAuthError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent duplicate requests
    if (loading || !email.trim() || !password.trim()) return

    setLoading(true)

    // Clear old error
    setAuthError('')

    try {
      const result = await login(
        email.trim(),
        password.trim()
      )

      if (!result || !result.success) {
        throw new Error(result?.error || 'Login failed')
      }

      console.log('Login Success ✅')

      // Clear form after success
      setEmail('')
      setPassword('')
      setAuthError('')

    } catch (error: any) {

      console.error('Login Error details:', error)

      const errorMessage = error?.message || ''

      // Wrong credentials
      if (
        errorMessage.includes('Invalid login credentials') ||
        errorMessage.toLowerCase().includes('incorrect')
      ) {

        setAuthError('Incorrect email or password.')

      }

      // Too many requests
      else if (
        errorMessage.includes('429') ||
        errorMessage.toLowerCase().includes('too many requests')
      ) {

        setAuthError(
          'Too many login attempts. Please wait a moment and try again.'
        )

      }

      // Stream/body issue
      else if (
        errorMessage.toLowerCase().includes('body stream already read')
      ) {

        setAuthError(
          'Authentication conflict detected. Please try again.'
        )

      }

      // Generic error
      else {

        setAuthError(
          errorMessage || 'Unable to login. Please try again.'
        )

      }

    } finally {

      setLoading(false)

    }
  }

  return (
    <LoginForm
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      loading={loading}
      authError={authError}
      onSubmit={handleLogin}
      onToggle={onToggle}
      onForgotPassword={onForgotPassword}
    />
  )
}