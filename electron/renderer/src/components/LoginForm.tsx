import React from 'react';

interface LoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onToggle: () => void;
  onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email, setEmail, password, setPassword,
  showPassword, setShowPassword, loading, onSubmit, onToggle, onForgotPassword
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter">
           Work<span className="text-indigo-500">Snap</span>
        </h2>
        <p className="text-slate-500 text-sm mt-2 font-medium">Welcome back, please login</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email Address"
          required
          disabled={loading}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            disabled={loading}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3.5 text-[10px] text-indigo-400 font-bold hover:text-indigo-300 uppercase tracking-widest"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          disabled={loading}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'LOG IN'}
        </button>
      </form>

      <div className="flex flex-col gap-3 text-center mt-6 text-sm">
        <button type="button" onClick={onForgotPassword} className="text-indigo-600 font-semibold hover:text-indigo-500">
          Forgot password?
        </button>

        <p className="text-slate-500">
          New here?{' '}
          <button onClick={onToggle} className="text-indigo-600 font-semibold hover:text-indigo-500">
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;