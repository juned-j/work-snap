import { useState } from 'react'
import { useAuthContext } from './hooks/useAuthContext'
import RegisterForm from './RegisterForm'


export default function Register({ onToggle }: { onToggle: () => void }) {
  const { register } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    try {
      const result = await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password.trim()
      )

      if (!result.success) {
        throw new Error(result.error || 'Registration failed')
      }

      alert('Account created successfully! You are now logged in.')
    } catch (err: any) {
      console.error('Register Error:', err.message)
      alert(err.message || 'Unable to register. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RegisterForm 
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleRegister}
      loading={loading}
      onToggle={onToggle}
    />
  )
}