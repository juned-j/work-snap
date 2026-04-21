import { useState } from 'react'
import { supabase } from '../api/supabase'

export default function Login({ onToggle }: { onToggle: () => void }) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false) // 👈 new

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      })

      if (error) throw error

      alert("Login successful ✅")

    } catch (error: any) {
      console.error(error.message)

      if (error.message.includes("Invalid login credentials")) {
        alert("Wrong email or password ❌")
      } else if (error.message.includes("Email not confirmed")) {
        alert("Please verify your email first 📧")
      } else {
        alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">

        <input
          type="email"
          placeholder="Email Address"
          required
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={e => setEmail(e.target.value)}
        />

        {/* Password Field with Toggle */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"} // 👈 toggle
            placeholder="Password"
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={e => setPassword(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3 text-sm text-indigo-400"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          disabled={loading}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
        >
          {loading ? 'Logging in...' : 'LOG IN'}
        </button>
      </form>

      <p className="text-center text-slate-500 text-sm">
        New here?{' '}
        <button onClick={onToggle} className="text-indigo-400 font-bold hover:underline">
          Sign Up
        </button>
      </p>
    </div>
  )
}