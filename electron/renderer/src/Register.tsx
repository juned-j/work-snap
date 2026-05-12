import { useState } from 'react'
import { authService } from './services/authService'
import RegisterForm from './RegisterForm';


export default function Register({ onToggle }: { onToggle: () => void }) {
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
      await authService.registerUser(formData)
      alert('Account created successfully! Please login.')
      onToggle()
    } catch (err: any) {
      console.error("Register Error:", err.message)
      alert(err.message)
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