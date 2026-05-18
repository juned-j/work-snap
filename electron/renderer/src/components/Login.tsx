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
    if (loading) return

    setLoading(true)

    try {
      const result = await login(email.trim(), password.trim())
      if (!result.success) {
        throw new Error(result.error || 'Login failed')
      }
      console.log('Login Success ✅')
    } catch (error: any) {
      console.error('Login Error:', error.message)
      if (error.message.includes('Invalid login credentials')) {
        alert('Incorrect email or password.')
      } else {
        alert(error.message || 'Unable to login. Please try again.')
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
      onSubmit={handleLogin}
      onToggle={onToggle}
      onForgotPassword={onForgotPassword}
    />
  );
}