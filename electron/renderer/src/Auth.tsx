import { useState } from 'react'
import Login from './components/Login'
import Register from './Register'
import ForgotPassword from './components/ForgotPassword'

export default function Auth() {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login')

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {view === 'login' && (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-10 shadow-xl">
            <Login
              onToggle={() => setView('register')}
              onForgotPassword={() => setView('forgot')}
            />
          </div>
        )}

        {view === 'register' && (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-10 shadow-xl">
            <Register onToggle={() => setView('login')} />
          </div>
        )}

        {view === 'forgot' && (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-10 shadow-xl">
            <ForgotPassword onBack={() => setView('login')} />
          </div>
        )}
      </div>
    </div>
  )
}