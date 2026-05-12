import React, { useState } from 'react'
import { authService } from '../services/authService'

export default function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setStatus('idle')
    setMessage('')

    try {
      const exists = await authService.verifyEmail(email)
      if (!exists) {
        setStatus('error')
        setMessage('No account found for this email address.')
      } else {
        await authService.sendPasswordReset(email)
        setStatus('sent')
        setMessage('If an account exists, a password reset link has been sent to your email.')
      }
    } catch (error: any) {
      setStatus('error')
      setMessage(error?.message || 'Unable to send reset instructions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-[2rem] p-10 shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
          Forgot Password
        </h2>
        <p className="text-slate-500 text-sm mt-2">
          Enter your email to receive reset instructions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email Address"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />

        {message ? (
          <div className={`rounded-2xl px-4 py-3 text-sm ${status === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
            {message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        Remembered your password?{' '}
        <button type="button" onClick={onBack} className="text-indigo-600 font-semibold hover:text-indigo-500">
          Back to login
        </button>
      </div>
    </div>
  )
}
