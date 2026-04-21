import { useState } from 'react'
import Login from './components/Login'
import Register from './components/Register'

export default function Auth() {
  const [showRegister, setShowRegister] = useState(false)

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2rem] p-10 shadow-2xl">
        {showRegister ? (
          <Register onToggle={() => setShowRegister(false)} />
        ) : (
          <Login onToggle={() => setShowRegister(true)} />
        )}
      </div>
    </div>
  )
}