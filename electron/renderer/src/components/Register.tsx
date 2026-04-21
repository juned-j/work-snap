import { useState } from 'react'
import { supabase } from '../supabaseClient'

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
      // ✅ 1. CREATE AUTH USER
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password.trim(),
        options: {
          data: { name: formData.name }
        }
      })

      if (error) throw error

      // 🔥 AUTO-LOGIN ROKNE KE LIYE: 
      // Kyunki Confirm Email OFF hai, naya user turant login ho jata hai. 
      // SignOut karne se session clear ho jayega.
      await supabase.auth.signOut()

      const user = data.user
      if (!user) throw new Error("User not created")

      // ✅ 2. INSERT INTO USERS TABLE
      const { error: dbError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          name: formData.name,
          email: formData.email.trim()
        })

      if (dbError) console.error("Users Table Error:", dbError.message)

      alert('Account created successfully! Please login.')
      onToggle() // Wapas login screen par bhejne ke liye

    } catch (err: any) {
      console.error("Register Error:", err.message)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black">
            Work<span className="text-indigo-500">Snap</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">Create your account</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email Address"
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <button
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'REGISTER'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account?{' '}
          <button onClick={onToggle} className="text-indigo-400 font-bold hover:underline">
            Login
          </button>
        </p>
      </div>
    </div>
  )
}