import { useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'
import LoginForm from './LoginForm'

export default function Login({ onToggle, onForgotPassword }: { onToggle: () => void; onForgotPassword: () => void }) {
  const { login } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 1. Prevent duplicate requests if already loading or missing inputs
    if (loading || !email.trim() || !password.trim()) return

    setLoading(true)

    try {
      const result = await login(email.trim(), password.trim())
      
      if (!result || !result.success) {
        throw new Error(result?.error || 'Login failed')
      }
      
      console.log('Login Success ✅')
      
      // 2. Clear credentials on successful login to prevent reuse issues
      setEmail('')
      setPassword('')
    } catch (error: any) {
      console.error('Login Error details:', error)
      
      // 3. Handle specific rate-limiting or stream read messages gracefully
      const errorMessage = error.message || ''
      
      if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('too many requests')) {
        alert('Too many login attempts. Please wait a moment before trying again.')
      } else if (errorMessage.includes('Invalid login credentials') || errorMessage.toLowerCase().includes('incorrect')) {
        alert('Incorrect email or password.')
      } else if (errorMessage.includes('body stream already read')) {
        // Safe fallback if context stream hits a snag on error formatting
        alert('Authentication setup conflict. Please try hitting login once more.')
      } else {
        alert(errorMessage || 'Unable to login. Please try again.')
      }
    } finally {
      // 4. Ensure loading state is reset properly every time
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
      onSubmit={handleLogin}
      onToggle={onToggle}
      onForgotPassword={onForgotPassword}
    />
  );
}