import React, { useState } from 'react'

interface LoginFormProps {
  email: string
  setEmail: (val: string) => void

  password: string
  setPassword: (val: string) => void

  showPassword: boolean
  setShowPassword: (val: boolean) => void

  loading: boolean

  authError: string

  onSubmit: (e: React.FormEvent) => void

  onToggle: () => void
  onForgotPassword: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,

  password,
  setPassword,

  showPassword,
  setShowPassword,

  loading,
  authError,

  onSubmit,

  onToggle,
  onForgotPassword
}) => {

  const [errors, setErrors] = useState<{
    email?: string
    password?: string
  }>({})

  const validate = () => {

    const errs: {
      email?: string
      password?: string
    } = {}

    // Email validation
    if (!email.trim()) {

      errs.email = 'Email is required'

    } else if (
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
    ) {

      errs.email = 'Enter a valid email address'

    }

    // Password validation
    if (!password.trim()) {

      errs.password = 'Password is required'

    } else if (password.length < 6) {

      errs.password = 'Password must be at least 6 characters'

    }

    setErrors(errs)

    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {

    if (!validate()) {

      e.preventDefault()
      return

    }

    onSubmit(e)
  }

  return (

    <div className="space-y-6">

      {/* Header */}
      <div className="text-center">

        <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter">
          Work<span className="text-indigo-500">Snap</span>
        </h2>

        <p className="text-slate-500 text-sm mt-2 font-medium">
          Welcome back, please login
        </p>

      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        {/* Backend/Auth Error */}
        {authError && (

          <div className="bg-red-100 border border-red-300 text-red-600 text-sm font-medium px-4 py-3 rounded-2xl">

            {authError}

          </div>

        )}

        {/* Email */}
        <div>

          <input
            type="email"
            placeholder="Email Address"
            required
            disabled={loading}
            value={email}
            onChange={(e) => {

              setEmail(e.target.value)

              if (errors.email) {
                setErrors({
                  ...errors,
                  email: undefined
                })
              }

            }}
            className={`w-full bg-slate-50 border ${
              errors.email
                ? 'border-red-400'
                : 'border-slate-200'
            } rounded-2xl px-4 py-3.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50`}
          />

          {errors.email && (

            <div className="text-red-500 text-xs font-semibold mt-1">

              {errors.email}

            </div>

          )}

        </div>

        {/* Password */}
        <div className="relative">

          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            required
            disabled={loading}
            value={password}
            onChange={(e) => {

              setPassword(e.target.value)

              if (errors.password) {

                setErrors({
                  ...errors,
                  password: undefined
                })

              }

            }}
            className={`w-full bg-slate-50 border ${
              errors.password
                ? 'border-red-400'
                : 'border-slate-200'
            } rounded-2xl px-4 py-3.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50`}
          />

          {/* Show Hide Button */}
          <button
            type="button"
            onClick={() =>
              setShowPassword(!showPassword)
            }
            className="absolute right-4 top-3.5 text-[10px] text-indigo-400 font-bold hover:text-indigo-300 uppercase tracking-widest"
          >

            {showPassword ? 'Hide' : 'Show'}

          </button>

          {/* Password Error */}
          {errors.password && (

            <div className="text-red-500 text-xs font-semibold mt-1">

              {errors.password}

            </div>

          )}

        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
        >

          {loading
            ? 'Processing...'
            : 'LOG IN'}

        </button>

      </form>

      {/* Footer */}
      <div className="flex flex-col gap-3 text-center mt-6 text-sm">

        <button
          type="button"
          onClick={onForgotPassword}
          className="text-indigo-600 font-semibold hover:text-indigo-500"
        >

          Forgot password?

        </button>

        <p className="text-slate-500">

          New here?{' '}

          <button
            type="button"
            onClick={onToggle}
            className="text-indigo-600 font-semibold hover:text-indigo-500"
          >

            Create Account

          </button>

        </p>

      </div>

    </div>
  )
}

export default LoginForm